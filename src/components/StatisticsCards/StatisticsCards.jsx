import { useState, useMemo } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentArrowDownIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    NoSymbolIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import styles from './StatisticsCards.module.css';

const TIME_FILTERS = [
    { id: 'month', label: 'Bu Ay', days: 30 },
    { id: '3months', label: '3 Ay', days: 90 },
    { id: '6months', label: '6 Ay', days: 180 },
    { id: 'year', label: '1 Yıl', days: 365 },
    { id: 'all', label: 'Tüm Zamanlar', days: null }
];

export default function StatisticsCards({
    appointments = [],
    onExportPDF,
    title = "Randevu İstatistikleri"
}) {
    const [timeFilter, setTimeFilter] = useState('all');

    // Filter appointments based on time filter
    const filteredAppointments = useMemo(() => {
        const selectedFilter = TIME_FILTERS.find(f => f.id === timeFilter);
        if (!selectedFilter || selectedFilter.days === null) {
            return appointments;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - selectedFilter.days);

        return appointments.filter(apt => {
            const aptDate = new Date(apt.createdAt || apt.date);
            return aptDate >= cutoffDate;
        });
    }, [appointments, timeFilter]);

    // Calculate statistics from filtered appointments
    const totalCount = filteredAppointments.length;
    const approvedCount = filteredAppointments.filter(a => a.status === 'approved').length;
    const rejectedCount = filteredAppointments.filter(a => a.status === 'rejected').length;
    const pendingCount = filteredAppointments.filter(a => a.status === 'pending').length;
    const noResponseCount = filteredAppointments.filter(a => a.status === 'no_response').length;
    const cancelledCount = filteredAppointments.filter(a => a.status === 'cancelled').length;

    // Calculate percentages
    const approvedPercent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
    const rejectedPercent = totalCount > 0 ? Math.round((rejectedCount / totalCount) * 100) : 0;
    const pendingPercent = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
    const noResponsePercent = totalCount > 0 ? Math.round((noResponseCount / totalCount) * 100) : 0;
    const cancelledPercent = totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;

    const stats = [
        {
            title: 'Onaylanan',
            value: approvedCount,
            percent: approvedPercent,
            icon: CheckCircleIcon,
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            iconBg: 'bg-green-100'
        },
        {
            title: 'Reddedilen',
            value: rejectedCount,
            percent: rejectedPercent,
            icon: XCircleIcon,
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            iconBg: 'bg-red-100'
        },
        {
            title: 'Beklemede',
            value: pendingCount,
            percent: pendingPercent,
            icon: ClockIcon,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            iconBg: 'bg-yellow-100'
        },
        {
            title: 'Cevaplanmadı',
            value: noResponseCount,
            percent: noResponsePercent,
            icon: ExclamationCircleIcon,
            color: 'gray',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-600',
            iconBg: 'bg-gray-100'
        },
        {
            title: 'İptal Edilen',
            value: cancelledCount,
            percent: cancelledPercent,
            icon: NoSymbolIcon,
            color: 'orange',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            iconBg: 'bg-orange-100'
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <ChartBarIcon className={styles.headerIcon} />
                    <h3 className={styles.title}>{title}</h3>
                </div>
                <div className={styles.headerActions}>
                    {/* Time Filter */}
                    <div className={styles.timeFilter}>
                        <CalendarDaysIcon className={styles.filterIcon} />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            {TIME_FILTERS.map(filter => (
                                <option key={filter.id} value={filter.id}>
                                    {filter.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {onExportPDF && (
                        <button
                            onClick={onExportPDF}
                            className={styles.exportButton}
                        >
                            <DocumentArrowDownIcon className={styles.exportIcon} />
                            PDF İndir
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
                            <div className={`${styles.iconWrapper} ${stat.iconBg}`}>
                                <Icon className={`${styles.statIcon} ${stat.textColor}`} />
                            </div>
                            <div className={styles.statContent}>
                                <p className={styles.statTitle}>{stat.title}</p>
                                <div className={styles.statValue}>
                                    <span className={styles.value}>{stat.value}</span>
                                    <span className={styles.percent}>({stat.percent}%)</span>
                                </div>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={`${styles.progressFill} ${styles[`${stat.color}Fill`]}`}
                                    style={{ width: `${stat.percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.summary}>
                <p className={styles.summaryText}>
                    Toplam: <strong>{totalCount}</strong> randevu
                    <span className={styles.filterLabel}>
                        ({TIME_FILTERS.find(f => f.id === timeFilter)?.label})
                    </span>
                </p>
            </div>
        </div>
    );
}
