import React from "react";
import { useAdminStore } from "../../store/useAdminStore";
// Import both styles
import dashboardStyles from "../../styles/AdminDashboard.module.css";
import logStyles from "../../styles/LogsTab.module.css";

import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  User,
  Database,
} from "lucide-react";

const LogsTab: React.FC = () => {
  const {
    logs,
    paginationLogs,
    isLoadingLogs,
    searchTerm,
    currentPageLogs,
    setCurrentPageLogs,
    fetchLogs,
    deleteLog,
  } = useAdminStore();

  const handleLogsPageChange = (newPage: number) => {
    if (newPage < 1 || (paginationLogs && newPage > paginationLogs.last_page))
      return;
    setCurrentPageLogs(newPage);
    fetchLogs(newPage, searchTerm);
  };

  const getMimeClass = (mime: string) => {
    if (mime.includes("image")) return logStyles.mimeImage;
    if (mime.includes("pdf")) return logStyles.mimePdf;
    if (mime.includes("zip") || mime.includes("rar")) return logStyles.mimeZip;
    return logStyles.mimeDefault;
  };

  return (
    <div className={dashboardStyles.dashboardGrid}>
      <div className={dashboardStyles.inventorySection}>
        <div className={dashboardStyles.glassCard}>
          <div className={dashboardStyles.cardHeader}>
            <div className={logStyles.headerInfo}>
              <h3>Upload Activity Logs</h3>
              <span className={logStyles.countBadge}>
                {paginationLogs?.total || 0} Total
              </span>
            </div>
          </div>

          <div className={dashboardStyles.tableArea}>
            {isLoadingLogs ? (
              <div className={dashboardStyles.skeletonLoader}>
                <p>Syncing with MongoDB...</p>
              </div>
            ) : (
              <table className={dashboardStyles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Asset Details</th>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Origin</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={logStyles.emptyState}>
                        <Database size={40} />
                        <p>No upload logs match your search.</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id || log.created_at}>
                        <td className={logStyles.dateTimeCell}>
                          <span className={logStyles.primaryText}>
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                          <span className={logStyles.secondaryText}>
                            {new Date(log.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td>
                          <div className={logStyles.fileInfo}>
                            <FileText
                              size={16}
                              className={logStyles.fileIcon}
                            />
                            <div>
                              <div className={logStyles.fileName}>
                                {log.file_name}
                              </div>
                              <div className={logStyles.productId}>
                                ID: {log.product_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={dashboardStyles.sizeText}>
                            {(log.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${logStyles.mimeBadge} ${getMimeClass(log.mime)}`}
                          >
                            {log.mime.split("/")[1] || log.mime}
                          </span>
                        </td>
                        <td>
                          <div className={logStyles.originInfo}>
                            <span className={logStyles.ipAddress}>
                              <Globe size={12} /> {log.ip}
                            </span>
                            <span className={logStyles.userLabel}>
                              <User size={12} /> {log.uploaded_by}
                            </span>
                          </div>
                        </td>
                        <td className={logStyles.actionsCell}>
                          <button
                            onClick={() => deleteLog(log._id!)}
                            className={dashboardStyles.deleteBtn}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {paginationLogs && paginationLogs.last_page > 1 && (
            <div className={dashboardStyles.paginationWrapper}>
              <div className={dashboardStyles.pagination}>
                <button
                  disabled={currentPageLogs === 1}
                  onClick={() => handleLogsPageChange(currentPageLogs - 1)}
                  className={dashboardStyles.pArrow}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className={dashboardStyles.pPages}>
                  Page <strong>{currentPageLogs}</strong> of{" "}
                  {paginationLogs.last_page}
                </div>
                <button
                  disabled={currentPageLogs === paginationLogs.last_page}
                  onClick={() => handleLogsPageChange(currentPageLogs + 1)}
                  className={dashboardStyles.pArrow}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className={dashboardStyles.sideControls}>
        <div className={dashboardStyles.glassCard}>
          <div className={logStyles.summaryTitle}>
            <Database size={18} />
            <h3>Storage Summary</h3>
          </div>
          <div className={logStyles.statList}>
            <div className={logStyles.statItem}>
              <span>Total Logs</span>
              <strong>{paginationLogs?.total || 0}</strong>
            </div>
            <div className={logStyles.statItem}>
              <span>Current View</span>
              <strong>{logs.length} entries</strong>
            </div>
          </div>
          <div className={logStyles.infoBox}>
            <p>Logs reflect all successful file uploads to the marketplace.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LogsTab;
