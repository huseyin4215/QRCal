import { useState } from 'react';
import styles from '../styles/tabNavigation.module.css';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className={`${styles.tabNavigation} ${styles[`theme-${activeTab}`] || ''}`} data-active-tab={activeTab}>
      <div className={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.active : ''
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabText}>{tab.label}</span>
            {activeTab === tab.id && <div className={styles.activeIndicator} />}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation; 