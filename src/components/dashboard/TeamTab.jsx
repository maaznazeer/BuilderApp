import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const TeamTab = ({ projects, handleFeatureClick }) => {
  const { t } = useTranslation('custom');
  const allTeamMembers = React.useMemo(() => {
    const membersMap = new Map();
    projects.forEach(project => {
      project.team.forEach(member => {
        if (!membersMap.has(member.id)) {
          membersMap.set(member.id, { ...member, projects: [project.name] });
        } else {
          membersMap.get(member.id).projects.push(project.name);
        }
      });
    });
    return Array.from(membersMap.values());
  }, [projects]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('team.title')}</h2>
          <p className="text-gray-600">{t('team.description')}</p>
        </div>
        <Button onClick={() => handleFeatureClick('Invite Member')}>
          <UserPlus className="mr-2 h-4 w-4" /> {t('team.invite_member')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTeamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center card-hover"
          >
            <img  className="w-24 h-24 rounded-full mx-auto mb-4" alt={`Profile picture of ${member.name}`} src="https://images.unsplash.com/photo-1575383596664-30f4489f9786" />
            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
            <p className="text-blue-600 font-medium mb-2">{member.role}</p>
            <div className="flex justify-center space-x-4 my-4">
              <Button variant="outline" size="icon" onClick={() => handleFeatureClick('Email Member')}>
                <Mail className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleFeatureClick('Call Member')}>
                <Phone className="w-4 h-4" />
              </Button>
            </div>
            <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">{t('team.assigned_projects')}:</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                    {member.projects.map(p => (
                        <span key={p} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{p}</span>
                    ))}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamTab;