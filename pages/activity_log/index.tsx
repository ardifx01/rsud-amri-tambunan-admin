import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  TablePagination,
  Box,
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import Head from "next/head";
import { Close } from "@mui/icons-material";
import { showErrorToast } from "@/utils/notif";
import { getRequest } from "@/utils/apiClient";
import LoadingComponent from "@/components/LoadingComponent";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

interface ActivityLog {
  id: number;
  user_id: number | null;
  name: string | null;
  method: string;
  endpoint: string;
  request_body: string | null;
  status_code: string;
  ip_address: string;
  created_at: string;
}

// interface PaginationData {
//   currentPage: number;
//   totalPages: number;
//   totalActivityLogs: number;
//   perPage: number;
// }

const ActivityLogs = () => {
  const router = useRouter();
  const {
    page: queryPage = "1",
    limit: queryLimit = "10",
    search: querySearch = "",
    date: queryDate = "",
  } = router.query as {
    page?: string;
    limit?: string;
    search?: string;
    date?: string;
  };

  const [activityLogsData, setActivityLogsData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [dateFilter, setDateFilter] = useState<dayjs.Dayjs | null>(
    queryDate ? dayjs(queryDate) : null
  );
  const [page, setPage] = useState(Number(queryPage) - 1); // 0-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(Number(queryLimit));
  const [totalActivityLogs, setTotalActivityLogs] = useState(0);
  // const [pagination, setPagination] = useState<PaginationData>({
  //   currentPage: 1,
  //   totalPages: 1,
  //   totalActivityLogs: 0,
  //   perPage: 10,
  // });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", (page + 1).toString());
      params.append("limit", rowsPerPage.toString());

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (dateFilter) {
        params.append("created_at", dateFilter.format("YYYY-MM-DD")); // ✅ Convert dayjs to string
      }

      const response = await getRequest(
        `/api/activity-log?${params.toString()}`
      );

      if (response.status === "success") {
        const { activityLogs, pagination: paginationData } = response.data;
        setActivityLogsData(activityLogs || []);
        // setPagination(paginationData);
        setTotalActivityLogs(paginationData?.totalActivityLogs || 0);
      } else {
        showErrorToast("Failed to fetch activity logs");
      }
    } catch (error) {
      console.error("Error fetching activity logs data:", error);
      showErrorToast("Error loading activity logs");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ cukup depend ke fetchData

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm, dateFilter, fetchData]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset ke halaman pertama saat pencarian berubah

    // Siapkan query parameter dengan tipe eksplisit
    const query: {
      menu: string;
      page: string;
      limit: string;
      search?: string;
      date?: string;
    } = {
      menu: "activity_log",
      page: "1",
      limit: rowsPerPage.toString(),
    };

    if (newSearchTerm) query.search = newSearchTerm;
    if (dateFilter) query.date = dateFilter.format("YYYY-MM-DD");

    // Update URL
    router.push({
      pathname: "/dashboard",
      query,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (statusCode: string) => {
    const code = parseInt(statusCode);
    if (code >= 200 && code < 300) return "#4CAF50"; // Green for success
    if (code >= 400 && code < 500) return "#FF9800"; // Orange for client error
    if (code >= 500) return "#F44336"; // Red for server error
    return "#757575"; // Gray for others
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "#2196F3"; // Blue
      case "POST":
        return "#4CAF50"; // Green
      case "PUT":
        return "#FF9800"; // Orange
      case "DELETE":
        return "#F44336"; // Red
      case "PATCH":
        return "#9C27B0"; // Purple
      default:
        return "#757575"; // Gray
    }
  };

  // Filter data based on search term and date
  const filteredActivityLogs = activityLogsData.filter((log) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      log.endpoint.toLowerCase().includes(lowerSearch) ||
      log.method.toLowerCase().includes(lowerSearch) ||
      log.ip_address.toLowerCase().includes(lowerSearch) ||
      (log.name?.toLowerCase().includes(lowerSearch) ?? false);

    const matchesDate =
      !dateFilter ||
      dayjs(log.created_at).format("YYYY-MM-DD") ===
        dateFilter.format("YYYY-MM-DD");

    return matchesSearch && matchesDate;
  });

  return (
    <>
      <Head>
        <title>Activity Logs</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>

      <div className="flex justify-start gap-2">
        <AssignmentIcon className="h-7 w-7 text-black" />
        <h2 className="text-xl font-semibold text-black">Activity Logs</h2>
      </div>

      <Grid item xs={12}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
            margin="normal"
            sx={{ flex: 2 }}
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")} edge="end">
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <div className="flex items-center space-x-2 w-[350px]">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Filter by Date"
                value={dateFilter}
                onChange={(newValue) => {
                  setDateFilter(newValue);
                  setPage(0);

                  const query: {
                    menu: string;
                    page: number;
                    limit: number;
                    search?: string;
                    date?: string;
                  } = {
                    menu: "activity_log",
                    page: 1,
                    limit: rowsPerPage,
                  };

                  if (searchTerm) query.search = searchTerm;
                  if (newValue) query.date = newValue.format("YYYY-MM-DD");

                  router.push({
                    pathname: "/dashboard",
                    query: {
                      ...query,
                      page: query.page.toString(),
                      limit: query.limit.toString(),
                    },
                  });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    margin: "normal",
                  },
                }}
              />
            </LocalizationProvider>

            {dateFilter && (
              <Tooltip title="Clear Date Filter">
                <IconButton
                  onClick={() => setDateFilter(null)}
                  size="small"
                  color="error"
                  sx={{ mt: "16px" }} // match vertical alignment with DatePicker
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Box>
      </Grid>

      {loading ? (
        <LoadingComponent
          text="Loading Activity Logs..."
          spinnerColor="#1e2dfa"
          textColor="#333"
        />
      ) : (
        <>
          <Paper>
            <TableContainer className="h-[800px] mt-1">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      No.
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      Method
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      Endpoint
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      Status Code
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      IP Address
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      User
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                      Created At
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivityLogs.length > 0 ? (
                    filteredActivityLogs.map((log, index) => (
                      <TableRow key={log.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: getMethodColor(log.method),
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "center",
                              minWidth: "60px",
                              display: "inline-block",
                            }}
                          >
                            {log.method}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "13px",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={log.endpoint}
                          >
                            {log.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: getStatusColor(log.status_code),
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "center",
                              minWidth: "50px",
                              display: "inline-block",
                            }}
                          >
                            {log.status_code}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontSize: "13px" }}
                          >
                            {log.ip_address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {log.name || log.user_id ? (
                            <Typography variant="body2">
                              {log.name || `User ID: ${log.user_id}`}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: "#9E9E9E", fontStyle: "italic" }}
                            >
                              Anonymous
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: "13px" }}>
                            {formatDate(log.created_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            color: "#6B7280",
                          }}
                        >
                          <SearchIcon
                            sx={{ fontSize: 40, color: "#9CA3AF", mb: 1 }}
                          />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            No activity logs found
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Try adjusting your search or filter to find what
                            youre looking for
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                borderTop: "1px solid #ddd",
                backgroundColor: "#fafafa",
              }}
            >
              {/* Information about data count */}
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                Showing {page * rowsPerPage + 1} -{" "}
                {Math.min((page + 1) * rowsPerPage, totalActivityLogs)} of{" "}
                {totalActivityLogs} results
              </Typography>

              {/* Pagination */}
              <TablePagination
                count={totalActivityLogs}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0); // Reset to first page when rows per page changes
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage={
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555",
                      fontWeight: "bold",
                    }}
                  >
                    Rows per page:
                  </Typography>
                }
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    minHeight: "48px",
                    padding: "0 16px",
                  },
                  "& .MuiTablePagination-selectLabel": {
                    color: "#555",
                    fontWeight: "bold",
                  },
                  "& .MuiTablePagination-select": {
                    color: "#333",
                    fontWeight: "bold",
                  },
                  "& .MuiTablePagination-actions button": {
                    color: "#0055ff",
                    "&:hover": {
                      backgroundColor: "rgba(0, 136, 255, 0.1)",
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </>
      )}
    </>
  );
};

export default ActivityLogs;
