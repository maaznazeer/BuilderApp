function faqItems(lang = 'en'){
  const t = (en, fr)=> (lang === 'fr' ? fr : en);
  return [
    // 1. General
    { cat:'general', q:t('What can I do from the dashboard?','Que puis-je faire depuis le tableau de bord ?'),
      a:t('See project KPIs, budgets, milestones, workforce and supply chain at a glance.',
         'Visualisez d’un coup d’œil les KPI projets, budgets, jalons, effectifs et chaîne d’approvisionnement.') },
    { cat:'general', q:t('How often is my data updated?','À quelle fréquence mes données sont-elles mises à jour ?'),
      a:t('Numbers update in real time after changes. Refresh if needed.',
         'Les chiffres se mettent à jour en temps réel. Actualisez si nécessaire.') },

    // 2. Projects & Milestones
    { cat:'projects', q:t('How do I add a new project?','Comment ajouter un nouveau projet ?'),
      a:t('Click “+ New Project” in Projects, fill details, save.',
         'Cliquez sur “+ Nouveau projet”, remplissez les détails, enregistrez.') },
    { cat:'projects', q:t('Where can I see upcoming milestones?','Où voir les jalons à venir ?'),
      a:t('Overview → “Milestones Due” or open the Projects page.',
         'Aperçu → “Jalons à venir” ou ouvrez la page Projets.') },

    // 3. Budget & Financials
    { cat:'financials', q:t('How do I track expenses?','Comment suivre les dépenses ?'),
      a:t('Go to Financials to log expenses, upload invoices, compare to budget.',
         'Allez dans Finances pour saisir les dépenses, téléverser les factures et comparer au budget.') },
    { cat:'financials', q:t('Can I export financial reports?','Puis-je exporter des rapports financiers ?'),
      a:t('Financials → Reports → choose PDF/Excel/CSV.',
         'Finances → Rapports → choisissez PDF/Excel/CSV.') },

    // 4. Workforce
    { cat:'workforce', q:t('How do I add workers or teams?','Comment ajouter des ouvriers ou des équipes ?'),
      a:t('Workforce → Workers → “Add Worker”, then assign to a project.',
         'Effectifs → Ouvriers → “Ajouter un ouvrier”, puis affectez à un projet.') },
    { cat:'workforce', q:t('How is payroll handled?','Comment est gérée la paie ?'),
      a:t('Payroll auto-calculates from hours and rates; see the Payroll tab.',
         'La paie est calculée automatiquement depuis les heures et tarifs ; voir l’onglet Paie.') },

    // 5. Supply Chain
    { cat:'supply', q:t('How do I add materials or suppliers?','Comment ajouter des matériaux ou des fournisseurs ?'),
      a:t('Supply Chain → Suppliers/Inventory → “Add …”.',
         'Chaîne logistique → Fournisseurs/Inventaire → “Ajouter …”.') },
    { cat:'supply', q:t('Can I track material deliveries?','Puis-je suivre les livraisons de matériaux ?'),
      a:t('Use Goods Received Notes to confirm and update stock.',
         'Utilisez les Bons de Réception pour confirmer et mettre à jour les stocks.') },

    // 6. AI Assistance
    { cat:'ai', q:t('How can the AI Assistant help me?','Comment l’IA peut-elle m’aider ?'),
      a:t('Ask-Builder Brain answers questions, suggests flows, checks progress.',
         'Ask-Builder Brain répond aux questions, suggère des workflows et vérifie l’avancement.') },
    { cat:'ai', q:t('Does the AI support multiple languages?','L’IA prend-elle en charge plusieurs langues ?'),
      a:t('Yes: English/French; local languages optional.',
         'Oui : anglais/français ; langues locales en option.') },

    // 7. Account & Access
    { cat:'account', q:t('How do I invite users?','Comment inviter des utilisateurs ?'),
      a:t('Settings → Users & Permissions → Invite and assign roles.',
         'Paramètres → Utilisateurs & Permissions → Inviter et attribuer des rôles.') },
    { cat:'account', q:t('Can I limit what my team sees?','Puis-je limiter ce que voit mon équipe ?'),
      a:t('Yes, via role-based permissions (Viewer/Manager/Owner).',
         'Oui, via les permissions par rôle (Lecteur/Manager/Propriétaire).') },

    // 8. Support
    { cat:'support', q:t('How do I get help?','Comment obtenir de l’aide ?'),
      a:t('Help → Contact Support or in-app chat. Help Center for guides.',
         'Aide → Contacter le support ou chat intégré. Centre d’aide pour les guides.') },
    { cat:'support', q:t('Can I request a new feature?','Puis-je demander une nouvelle fonctionnalité ?'),
      a:t('Settings → Feedback to submit requests.',
         'Paramètres → Commentaires pour soumettre vos demandes.') },
  ];
}

function filterFaq(items, q){
  if(!q) return items;
  const needle = (q||'').toLowerCase().trim();
  return items.filter(it => (it.q.toLowerCase().includes(needle) || it.a.toLowerCase().includes(needle)));
}

export { filterFaq, faqItems };