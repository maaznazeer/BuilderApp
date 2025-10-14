import { useQuery, useMutation, useQueryClient } from 'react-query';
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
    
    if (error) throw new Error(error.message);
    
    if (data && data.length > 0) {
      console.log('Found balance digests in database:', data);
      return data;
    }
    
    return [];
  } catch (dbError) {
    // If database fetch fails, try localStorage as fallback
    console.warn('Database fetch failed, using localStorage:', dbError.message);
    
    const localDigests = JSON.parse(localStorage.getItem('balance_digests') || '[]');
    const userDigests = localDigests.filter(digest => digest.user_id === userId);
    
    console.log('Local digests found:', userDigests);
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
