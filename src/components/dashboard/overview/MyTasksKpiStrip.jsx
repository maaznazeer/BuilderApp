import React from 'react';
import CardGroup from './CardGroup';

const MyTasksKpiStrip = () => {
    const cardsConfig = [
      { "title": "Unassigned to Me", "valueBinding": "my_unassigned" },
      { "title": "In Progress", "valueBinding": "my_inprogress" },
      { "title": "Completed", "valueBinding": "my_completed" }
    ];

    return <CardGroup cards={cardsConfig} title="My Tasks" onlyMine={true} />;
};

export default MyTasksKpiStrip;