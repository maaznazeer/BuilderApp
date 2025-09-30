import React from 'react';
import CardGroup from './CardGroup';

const KpiStrip = () => {
    const cardsConfig = [
      {
        "title": "Unassigned",
        "valueBinding": "count_unassigned"
      },
      {
        "title": "In Progress",
        "valueBinding": "count_inprogress"
      },
      {
        "title": "Completed",
        "valueBinding": "count_completed"
      }
    ];

    return <CardGroup cards={cardsConfig} />;
};

export default KpiStrip;