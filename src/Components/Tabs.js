import React, { useState } from 'react';


const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabs">
      <div className="tabs-header">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.map((tab, index) =>
          activeTab === index ? (
            <div key={index} className="tab">
              {tab.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default React.memo(Tabs);
