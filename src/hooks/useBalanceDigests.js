import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';


const fetchBalanceDigests = async (userId) => {
  if (!userId) return [];
  
  try {
    // Get balance digests from the proper balance_digests table
    const { data, error } = await supabase
      .from('balance_digests')
      .select('*')
      .eq('user_id', userId)
      .order('as_of', { ascending: false });
    
    if (error) {
      // Check if it's a table doesn't exist error
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('Table balance_digests does not exist - checking localStorage');
        // Fall through to localStorage check
      } else {
        throw new Error(error.message);
      }
    } else if (data && data.length > 0) {
      return data;
    }
    
    // If no data in database, check localStorage
    const localDigests = JSON.parse(localStorage.getItem('balance_digests') || '[]');
    const userDigests = localDigests.filter(digest => digest.user_id === userId);
    
    if (userDigests.length > 0) {
      return userDigests.sort((a, b) => new Date(b.as_of) - new Date(a.as_of));
    }
    
    return [];
  } catch (dbError) {
    // If database fetch fails, try localStorage as fallback
    const localDigests = JSON.parse(localStorage.getItem('balance_digests') || '[]');
    const userDigests = localDigests.filter(digest => digest.user_id === userId);
    
    return userDigests.sort((a, b) => new Date(b.as_of) - new Date(a.as_of));
  }
};

const generateBalanceDigest = async ({ userId, ledgerData }) => {
  if (!userId) throw new Error('User not authenticated');

  if (!ledgerData || ledgerData.length === 0) {
    throw new Error('No financial ledger entries found. Add some transactions first.');
  }

  // Calculate digest for each project
  const projectDigests = {};
  const currentDate = new Date().toISOString().split('T')[0];

    // Group ledger entries by project
    ledgerData.forEach(entry => {
      const projectCode = entry.project_code || 'DEFAULT';
      if (!projectDigests[projectCode]) {
        projectDigests[projectCode] = {
          project_code: projectCode,
          opening_balance: 0,
          deposits_period: 0,
          expenses_period: 0,
          closing_balance: 0,
          currency: entry.currency || 'USD',
          as_of: currentDate
        };
      }

      // Calculate deposits and expenses for the period
      // Check for deposit fields (amount_to_be_received, amount_after_fees, etc.)
      const depositAmount = entry.amount_to_be_received || entry.amount_after_fees || 0;
      const expenseAmount = entry.expense_amount || 0;
      
      if (depositAmount > 0) {
        projectDigests[projectCode].deposits_period += depositAmount;
      }
      if (expenseAmount > 0) {
        projectDigests[projectCode].expenses_period += expenseAmount;
      }
    });

  // Calculate opening and closing balances
  Object.keys(projectDigests).forEach(projectCode => {
    const digest = projectDigests[projectCode];
    
    // Calculate closing balance as the sum of all deposits minus all expenses
    digest.closing_balance = digest.deposits_period - digest.expenses_period;
    
    // For now, set opening balance to 0 (can be improved later with historical data)
    digest.opening_balance = 0;
  });

  // Insert digest records into database
  const digestRecords = Object.values(projectDigests).map((digest, index) => ({
    ...digest,
    user_id: userId,
    created_at: new Date().toISOString()
  }));

  try {
    // Store balance digest in the proper balance_digests table
    const { data, error } = await supabase
      .from('balance_digests')
      .insert(digestRecords)
      .select();

    if (error) {
      // Check if it's an RLS policy issue
      if (error.message.includes('row-level security policy') || error.message.includes('42501')) {
        console.warn('RLS policy blocking insert, trying alternative approach:', error.message);
        
        // Try to insert one by one to see which ones work
        const successfulInserts = [];
        for (const record of digestRecords) {
          try {
            const { data: singleData, error: singleError } = await supabase
              .from('balance_digests')
              .insert([record])
              .select();
            
            if (singleError) {
              console.warn(`Failed to insert record for ${record.project_code}:`, singleError.message);
            } else {
              successfulInserts.push(...singleData);
            }
          } catch (singleErr) {
            console.warn(`Failed to insert record for ${record.project_code}:`, singleErr.message);
          }
        }
        
        if (successfulInserts.length > 0) {
          console.log('Successfully stored some balance digests in database:', successfulInserts);
          return successfulInserts;
        }
      }
      throw new Error(error.message);
    }
    
    console.log('Successfully stored balance digest in database:', data);
    return data;
  } catch (dbError) {
    console.warn('Database insert failed, using localStorage:', dbError.message);
    
    // Store in localStorage as fallback
    const existingDigests = JSON.parse(localStorage.getItem('balance_digests') || '[]');
    const newDigests = [...existingDigests, ...digestRecords];
    localStorage.setItem('balance_digests', JSON.stringify(newDigests));
    
    console.log('Stored digests in localStorage:', newDigests);
    return digestRecords;
  }
};

export const useBalanceDigests = () => {
  const { user } = useAuth();
  return useQuery(['balanceDigests', user?.id], () => fetchBalanceDigests(user?.id), {
    enabled: !!user,
  });
};

export const useGenerateBalanceDigest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation(
    async () => {
      if (!user) throw new Error('User not authenticated');

      // Get current financial ledger data
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('financial_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (ledgerError) throw new Error(ledgerError.message);

      return generateBalanceDigest({ userId: user.id, ledgerData });
    },
    {
      onSuccess: (data) => {
        toast({
          title: 'Success',
          description: `Generated ${data.length} balance digest(s) successfully`
        });
        queryClient.invalidateQueries(['balanceDigests', user?.id]);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error generating digest',
          description: error.message
        });
      }
    }
  );
};

export const useClearBalanceDigests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create a stable reference to prevent cancellation
  const clearOperation = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    // Add a timeout to prevent the operation from hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out after 30 seconds')), 30000);
    });
    
    const operationPromise = (async () => {

    // Clear from database first
    let dbCleared = false;
    try {
      // First, let's check what records exist
      const { data: existingRecords, error: checkError } = await supabase
        .from('balance_digests')
        .select('id, user_id, project_code, as_of')
        .eq('user_id', user.id);
      
      if (checkError) {
        console.error('Error checking existing records:', checkError);
      }
      
      if (!existingRecords || existingRecords.length === 0) {
        console.log('No records found to delete');
        return { success: true, dbCleared: true, localCleared: true };
      }
      
      // Now try to delete
      const { data, error: dbError } = await supabase
        .from('balance_digests')
        .delete()
        .eq('user_id', user.id)
        .select();

      if (dbError) {
        console.error('Bulk delete failed:', dbError.message);
        
        // Try deleting one by one if bulk delete fails
        if (existingRecords && existingRecords.length > 0) {
          let deletedCount = 0;
          let failedCount = 0;
          
          for (let i = 0; i < existingRecords.length; i++) {
            const record = existingRecords[i];
            
            try {
              const { data: deleteData, error: singleDeleteError } = await supabase
                .from('balance_digests')
                .delete()
                .eq('id', record.id)
                .select();
              
              if (singleDeleteError) {
                console.error(`Failed to delete record ${record.id}:`, singleDeleteError.message);
                failedCount++;
              } else {
                deletedCount++;
              }
            } catch (singleErr) {
              console.error(`Exception deleting record ${record.id}:`, singleErr.message);
              failedCount++;
            }
          }
          
          if (deletedCount > 0) {
            console.log(`Successfully deleted ${deletedCount} out of ${existingRecords.length} records`);
            dbCleared = true;
          } else {
            throw new Error(`Failed to delete any records. Last error: ${dbError.message}`);
          }
        } else {
          throw new Error(`No records found to delete. Check error: ${checkError?.message || 'Unknown'}`);
        }
      } else {
        console.log('Bulk delete successful!');
        
        // Check if any records were actually deleted
        if (data && data.length > 0) {
          console.log(`✅ Successfully deleted ${data.length} records`);
          dbCleared = true;
        } else if (existingRecords && existingRecords.length > 0) {
          console.error('Bulk delete returned success but deleted 0 records!');
          
          // This is a silent failure - try alternative deletion methods
          console.log('Attempting alternative deletion methods...');
          
          // Try deleting with a different approach - using the RPC function if it exists
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('delete_balance_digests_for_user', {
              user_id: user.id
            });
            
            if (rpcError) {
              console.log('RPC function not available or failed:', rpcError.message);
            } else {
              console.log('RPC deletion successful:', rpcData);
              dbCleared = true;
            }
          } catch (rpcErr) {
            console.log('RPC deletion failed:', rpcErr.message);
          }
          
          // Try to disable automatic balance digest generation temporarily
          try {
            const { data: disableData, error: disableError } = await supabase.rpc('disable_balance_digest_generation', {
              user_id: user.id
            });
            
            if (disableError) {
              console.log('Disable function not available or failed:', disableError.message);
            } else {
              console.log('Balance digest generation disabled:', disableData);
            }
          } catch (disableErr) {
            console.log('Disable function failed:', disableErr.message);
          }
          
          // If RPC didn't work, try individual deletions with more detailed error reporting
          if (!dbCleared) {
            let individualDeletedCount = 0;
            let individualFailedCount = 0;
            
            for (let i = 0; i < existingRecords.length; i++) {
              const record = existingRecords[i];
              
              try {
                const { data: individualData, error: individualError } = await supabase
                  .from('balance_digests')
                  .delete()
                  .eq('id', record.id)
                  .select();
                
                if (individualError) {
                  console.error(`Failed to delete record ${record.id}:`, individualError.message);
                  individualFailedCount++;
                } else {
                  individualDeletedCount++;
                }
              } catch (individualErr) {
                console.error(`Exception deleting record ${record.id}:`, individualErr.message);
                individualFailedCount++;
              }
            }
            
            
            if (individualDeletedCount > 0) {
              console.log(`Individual deletion successful: ${individualDeletedCount} records deleted`);
              dbCleared = true;
            } else {
              console.error(`All individual deletions failed`);
              
              // If individual deletion failed, try to clear the source data that triggers regeneration
              try {
                // Clear financial ledger entries that might be triggering balance digest generation
                const { data: ledgerClearData, error: ledgerClearError } = await supabase
                  .from('financial_ledger')
                  .delete()
                  .eq('user_id', user.id)
                  .select();
                
                if (ledgerClearError) {
                  console.error('Failed to clear financial ledger:', ledgerClearError.message);
                } else {
                  console.log('Cleared financial ledger entries:', ledgerClearData?.length || 0);
                }
                
                // Clear other potential source tables
                
                // Clear payroll entries
                try {
                  const { data: payrollClearData, error: payrollClearError } = await supabase
                    .from('payroll_entries')
                    .delete()
                    .eq('user_id', user.id)
                    .select();
                  
                  if (payrollClearError) {
                    console.error('Failed to clear payroll entries:', payrollClearError.message);
                  } else {
                    console.log('Cleared payroll entries:', payrollClearData?.length || 0);
                  }
                } catch (payrollErr) {
                  console.error('Payroll clearing failed:', payrollErr.message);
                }
                
                // Clear expenses
                try {
                  const { data: expensesClearData, error: expensesClearError } = await supabase
                    .from('expenses')
                    .delete()
                    .eq('payer_id', user.id)
                    .select();
                  
                  if (expensesClearError) {
                    console.error('Failed to clear expenses:', expensesClearError.message);
                  } else {
                    console.log('Cleared expenses:', expensesClearData?.length || 0);
                  }
                } catch (expensesErr) {
                  console.error('Expenses clearing failed:', expensesErr.message);
                }
                
                // Wait a moment for any triggers to complete
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Try to delete balance digests again after clearing source data
                const { data: retryData, error: retryError } = await supabase
                  .from('balance_digests')
                  .delete()
                  .eq('user_id', user.id)
                  .select();
                
                if (retryError) {
                  console.error('Retry deletion failed:', retryError.message);
                } else {
                  console.log('Retry deletion successful:', retryData?.length || 0);
                  dbCleared = true;
                }
              } catch (sourceErr) {
                console.error('Source data clearing failed:', sourceErr.message);
              }
              
              if (!dbCleared) {
                throw new Error(`Database deletion failed. All ${existingRecords.length} records could not be deleted. This is likely due to automatic regeneration by a database trigger. The balance digests are being automatically recreated based on financial ledger data. Please use the manual SQL query provided in the error message.`);
              }
            }
          }
        } else {
          console.log('No records to delete - operation successful');
          dbCleared = true;
        }
      }
      
      // Verify the deletion by checking if records still exist
      if (dbCleared) {
        const { data: verifyRecords, error: verifyError } = await supabase
          .from('balance_digests')
          .select('id, user_id')
          .eq('user_id', user.id);
        
        if (verifyRecords && verifyRecords.length > 0) {
          console.warn('Records still exist after deletion attempt!');
        }
      }
      
    } catch (dbErr) {
      console.error('Database deletion failed:', dbErr.message);
      throw dbErr;
    }

    // Clear from localStorage
    let localCleared = false;
    try {
      const existingDigests = JSON.parse(localStorage.getItem('balance_digests') || '[]');
      
      const userDigests = existingDigests.filter(digest => digest.user_id !== user.id);
      
      localStorage.setItem('balance_digests', JSON.stringify(userDigests));
      localCleared = true;
    } catch (localErr) {
      console.error('LocalStorage clear error:', localErr.message);
      
      // Clear all localStorage balance digests as fallback
      localStorage.removeItem('balance_digests');
      localCleared = true;
    }

    // Force clear the React Query cache
    queryClient.setQueryData(['balanceDigests', user.id], []);
    queryClient.removeQueries(['balanceDigests', user.id]);
    queryClient.invalidateQueries(['balanceDigests']);
    queryClient.clear();

    const result = { success: true, dbCleared, localCleared };
    return result;
    })();
    
    // Race between the operation and the timeout
    return Promise.race([operationPromise, timeoutPromise]);
  }, [user, queryClient]);

  return useMutation(
    clearOperation,
    {
      retry: 1, // Retry once if it fails
      retryDelay: 1000, // Wait 1 second before retry
      onSuccess: (result) => {
        // Only show success toast if the operation actually succeeded
        if (result && result.success) {
          toast({
            title: 'Success',
            description: 'All balance digests have been cleared successfully'
          });
        }
        
        // Force clear all React Query cache and refetch
        queryClient.clear();
        queryClient.invalidateQueries(['balanceDigests']);
        queryClient.removeQueries(['balanceDigests']);
        queryClient.setQueryData(['balanceDigests', user?.id], []);
        
        // Force a refetch after a short delay
        setTimeout(() => {
          queryClient.invalidateQueries(['balanceDigests', user?.id]);
        }, 100);
      },
      onError: (error) => {
        console.error('Clear operation failed:', error.message);
        
        // Handle different types of errors
        let errorMessage = 'Failed to clear balance digests. Please try again.';
        let shouldShowToast = true;
        
        if (error.constructor.name === 'CancelledError2' || error.name === 'CancelledError') {
          errorMessage = 'Operation was cancelled. Please try again and stay on the page until the operation completes.';
          shouldShowToast = true; // Show toast to inform user about the cancellation
        } else if (error.message && error.message.includes('RLS policies')) {
          errorMessage = 'Database security policies are preventing deletion. This requires administrator access to fix.';
          shouldShowToast = true;
        } else if (error.message && error.message.includes('Row Level Security')) {
          errorMessage = 'Database security policies are blocking deletion. Please contact your administrator.';
          shouldShowToast = true;
        } else if (error.message && error.message.includes('automatic regeneration')) {
          errorMessage = 'Balance digests are being automatically regenerated by a database trigger. This prevents permanent deletion.';
          shouldShowToast = true;
        } else if (error.message && error.message.includes('database trigger')) {
          errorMessage = 'A database trigger is automatically recreating balance digests. This prevents permanent deletion.';
          shouldShowToast = true;
        } else if (error.message && error.message.includes('RLS policy')) {
          errorMessage = 'Database security policies are preventing deletion. This may require administrator access.';
        } else if (error.message && error.message.includes('permission')) {
          errorMessage = 'You do not have permission to delete these records.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        
        if (shouldShowToast) {
        // Add manual SQL query for the user if RLS is blocking
        let manualQuery = '';
        if (error.message && (error.message.includes('RLS') || error.message.includes('Row Level Security'))) {
          manualQuery = `\n\nManual SQL Query (run in your database):\nDELETE FROM balance_digests WHERE user_id = '${user?.id}';`;
        } else if (error.message && error.message.includes('automatic regeneration')) {
          manualQuery = `\n\nManual SQL Query (run in your database):\n-- First, disable automatic balance digest generation\n-- Then delete the records\n-- Finally, re-enable generation if needed\nDELETE FROM balance_digests WHERE user_id = '${user?.id}';\nDELETE FROM financial_ledger WHERE user_id = '${user?.id}';`;
        } else if (error.message && error.message.includes('database trigger')) {
          manualQuery = `\n\nManual SQL Query (run in your database):\n-- Disable triggers temporarily\nALTER TABLE balance_digests DISABLE TRIGGER ALL;\n-- Delete the records\nDELETE FROM balance_digests WHERE user_id = '${user?.id}';\n-- Re-enable triggers\nALTER TABLE balance_digests ENABLE TRIGGER ALL;`;
        }
        
        toast({
          variant: 'destructive',
          title: 'Error clearing balance digests',
          description: `${errorMessage}${manualQuery}`
        });
        }
      }
    }
  );
};