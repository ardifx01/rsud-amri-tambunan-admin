import { useCallback, useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Divider,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { useRouter } from "next/router";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import Head from "next/head";
import {
  Close,
  ListAltOutlined,
  ScienceOutlined,
  RefreshOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { getRequest } from "@/utils/apiClient";
import LoadingComponent from "@/components/LoadingComponent";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import { FaBarcode } from "react-icons/fa";
import BarcodeComponent from "@/components/BarcodeComponent";
import "dayjs/locale/id";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

interface LabOrder {
  id: number;
  patient_code: string;
  no_rm: string;
  no_registrasi: string;
  referral_doctor: string;
  lab_number: string;
  barcode: string;
  room: string;
  nik: string;
  name: string;
  gender: string;
  note: string | null;
  place_of_birth: string;
  date_of_birth: string;
  address: string;
  number_phone: string | null;
  email: string | null;
  status: string;
  is_order: number;
  created_at: string;
  updated_at: string;
}

interface GlucoseTest {
  id: number;
  lab_number: string;
  date_time: string;
  glucos_value: string;
  unit: string;
  patient_id: number;
  metode: string;
}

interface LabOrderDetailProps {
  labOrderId: string;
}

const LabOrderDetail = () => {
  const [glucoseTests, setGlucoseTests] = useState<GlucoseTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0);

  const router = useRouter();
  const { labOrderId } = router.query;
  const id = Array.isArray(labOrderId) ? labOrderId[0] : labOrderId;

  const [labOrder, setLabOrder] = useState<LabOrder | null>(null);

  const { page: queryPage = "1", limit: queryLimit = "10" } = router.query as {
    page?: string;
    limit?: string;
  };

  const [rowsPerPage, setRowsPerPage] = useState(Number(queryLimit));
  const [page, setPage] = useState(Number(queryPage) - 1);
  const [open, setOpen] = useState(false);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [dateFilterType, setDateFilterType] = useState<"single" | "range">(
    "single"
  );

  const fetchLabOrderDetail = async (id: string) => {
    try {
      setLoading(true);
      const result = await getRequest(`/v1/bridging/mapping-patient/${id}`);
      setLabOrder(result.data);
    } catch (error) {
      console.error("Error fetching lab order detail:", error);
      setError("Failed to fetch lab order details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlucoseTests = useCallback(async () => {
    if (!labOrderId) return;
    setLoadingTests(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", (page + 1).toString());
      queryParams.append("limit", rowsPerPage.toString());

      if (searchTerm) {
        queryParams.append("lab_number", searchTerm);
      }

      if (dateFilterType === "single" && selectedDate) {
        queryParams.append("date", selectedDate.format("YYYY-MM-DD"));
      } else if (dateFilterType === "range" && startDate && endDate) {
        queryParams.append("start_date", startDate.format("YYYY-MM-DD"));
        queryParams.append("end_date", endDate.format("YYYY-MM-DD"));
      }

      // Assuming we need to search by lab_number from the lab order
      if (labOrder?.lab_number) {
        queryParams.append("lab_number", labOrder.lab_number);
      }

      const result = await getRequest(
        `/api/test-glucosa/lab-order/${labOrderId}?${queryParams.toString()}`
      );

      setGlucoseTests(result.data || []);

      const totalAllRecords =
        result.pagination?.total_records ?? result.pagination?.total ?? 0;

      const totalFilteredRecords =
        result.pagination?.total_filtered ??
        result.pagination?.filtered ??
        (result.data ? result.data.length : 0);

      setTotalAll(totalAllRecords);
      setTotalFiltered(totalFilteredRecords);
      setTotalRows(totalFilteredRecords);
    } catch (error) {
      console.error("Error fetching glucose tests:", error);
      setError("Failed to fetch glucose tests.");
      setGlucoseTests([]);
    } finally {
      setLoadingTests(false);
    }
  }, [
    labOrderId,
    page,
    rowsPerPage,
    searchTerm,
    dateFilterType,
    selectedDate,
    startDate,
    endDate,
    labOrder?.lab_number,
  ]);

  useEffect(() => {
    if (id) {
      fetchLabOrderDetail(id);
    }
  }, [id]);

  useEffect(() => {
    if (labOrder) {
      fetchGlucoseTests();
    }
  }, [fetchGlucoseTests, labOrder]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDateFilterTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDateFilterType(event.target.value as "single" | "range");
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  const handleDateChange = (newDate: dayjs.Dayjs | null) => {
    setSelectedDate(newDate);
    setPage(0);
  };

  const handleStartDateChange = (newDate: dayjs.Dayjs | null) => {
    setStartDate(newDate);
    setPage(0);
  };

  const handleEndDateChange = (newDate: dayjs.Dayjs | null) => {
    setEndDate(newDate);
    setPage(0);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDate(null);
    setStartDate(null);
    setEndDate(null);
    setDateFilterType("single");
    setPage(0);
  };

  const handleRefresh = () => {
    fetchGlucoseTests();
  };

  function calculateAge(dateOfBirth: string): string {
    const birthDate = new Date(dateOfBirth);
    const currentDate = new Date();
    const years = differenceInYears(currentDate, birthDate);
    const months = differenceInMonths(currentDate, birthDate) % 12;
    const days = differenceInDays(currentDate, birthDate) % 30;
    return `${years} year ${months} month ${days} day`;
  }

  const getGlucoseChartData = () => {
    const sortedTests = [...glucoseTests].sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );
    const labels = sortedTests.map((test) =>
      new Date(test.date_time).toLocaleDateString("id-ID")
    );
    const data = sortedTests.map((test) => parseFloat(test.glucos_value));

    return {
      labels,
      datasets: [
        {
          label: "Glucose Level (mg/dL)",
          data,
          borderColor: "rgba(255, 0, 0, 1)",
          backgroundColor: "rgba(255, 0, 0, 0.2)",
          fill: false,
          tension: 0.7,
          pointRadius: 8,
          pointStyle: "circle",
        },
      ],
    };
  };

  const chartConfig = {
    type: "line" as const,
    data: getGlucoseChartData(),
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Glucose Level Over Time",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Glucose Value (mg/dL)",
          },
        },
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getOrderStatusColor = (isOrder: number) => {
    return isOrder === 1 ? "success" : "default";
  };

  if (loading) {
    return (
      <LoadingComponent
        text="Loading Lab Order Details..."
        spinnerColor="#1e2dfa"
        textColor="#333"
      />
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!labOrder) {
    return <Typography>Lab Order not found</Typography>;
  }

  const handleBackClick = () => {
    router.push("/dashboard?menu=lab-orders&page=1&limit=10&search=");
  };

  return (
    <>
      <Head>
        <title>Lab Order Details - {labOrder.lab_number}</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex justify-start items-center gap-2">
          <ScienceOutlined className="h-5 w-5 text-black" />
          <h2 className="text-xl font-semibold text-black">
            Lab Order Details
          </h2>
        </div>
        <Button
          onClick={handleBackClick}
          variant="outlined"
          startIcon={<FiArrowLeft />}
          sx={{ color: "#1976d2", fontWeight: "bold" }}
        >
          Back to Lab Orders
        </Button>
      </div>

      {/* Lab Order Information */}
      <div className="mt-2">
        <Paper elevation={3}>
          <Box sx={{ p: 3 }}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Lab Order Information
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={labOrder.status}
                  color={getStatusColor(labOrder.status) as any}
                  variant="filled"
                />
                <Chip
                  label={labOrder.is_order === 1 ? "Ordered" : "Not Ordered"}
                  color={getOrderStatusColor(labOrder.is_order) as any}
                  variant="outlined"
                />
              </Box>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-md font-semibold text-black">Lab Number</p>
                <p className="font-medium text-blue-600 text-lg">
                  {labOrder.lab_number}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Barcode</p>
                <div className="flex items-center space-x-2">
                  <IconButton onClick={() => setOpen(true)}>
                    <FaBarcode className="w-5 h-5 text-black" />
                  </IconButton>
                </div>
                <Dialog
                  open={open}
                  onClose={() => setOpen(false)}
                  maxWidth="xs"
                  fullWidth
                >
                  <DialogTitle className="flex justify-between items-center">
                    <span>Lab Order Barcode</span>
                    <IconButton onClick={() => setOpen(false)}>
                      <FiX className="w-5 h-5 text-gray-700" />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent>
                    <div className="flex justify-center p-4">
                      {labOrder.barcode ? (
                        <BarcodeComponent value={labOrder.barcode} />
                      ) : (
                        <BarcodeComponent value={labOrder.lab_number} />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Patient Code</p>
                <p className="font-medium">{labOrder.patient_code}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">No. RM</p>
                <p className="font-medium">{labOrder.no_rm}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Registration No.</p>
                <p className="font-medium">{labOrder.no_registrasi}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Referral Doctor</p>
                <p className="font-medium">{labOrder.referral_doctor}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Room</p>
                <p className="font-medium">{labOrder.room}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Order Date</p>
                <p className="font-medium">
                  {dayjs(labOrder.created_at)
                    .locale("id")
                    .format("dddd, DD MMMM YYYY HH:mm")}
                </p>
              </div>
            </div>

            <Divider sx={{ my: 3 }} />

            {/* Patient Information */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Patient Information
            </Typography>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-md font-semibold text-black">Name</p>
                <p className="font-medium">
                  {labOrder.name} [ {calculateAge(labOrder.date_of_birth)} ]
                </p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">NIK</p>
                <p className="font-medium">{labOrder.nik}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Gender</p>
                <p className="font-medium">{labOrder.gender}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Place of Birth</p>
                <p className="font-medium">{labOrder.place_of_birth}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Date of Birth</p>
                <p className="font-medium">
                  {new Date(labOrder.date_of_birth).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Phone Number</p>
                <p className="font-medium">{labOrder.number_phone || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-md font-semibold text-black">Address</p>
                <p className="font-medium">{labOrder.address}</p>
              </div>
              <div>
                <p className="text-md font-semibold text-black">Email</p>
                <p className="font-medium">{labOrder.email || "N/A"}</p>
              </div>
              {labOrder.note && (
                <div>
                  <p className="text-md font-semibold text-black">Note</p>
                  <p className="font-medium">{labOrder.note}</p>
                </div>
              )}
            </div>
          </Box>
        </Paper>
      </div>

      {/* Glucose Test Results Section */}
      <div className="mt-4">
        <div className="flex justify-start items-center gap-2">
          <ListAltOutlined className="h-5 w-5 mt-2 text-black" />
          <h2 className="text-xl font-semibold mt-2 text-black">
            Glucose Test Results
          </h2>
        </div>
        <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Search by Lab Number"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                sx={{ "& .MuiInputBase-root": { height: 55 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm("")} edge="end">
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Date Filter Type</FormLabel>
                <RadioGroup
                  row
                  value={dateFilterType}
                  onChange={handleDateFilterTypeChange}
                >
                  <FormControlLabel
                    value="single"
                    control={<Radio />}
                    label="Single Date"
                  />
                  <FormControlLabel
                    value="range"
                    control={<Radio />}
                    label="Date Range"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {dateFilterType === "single" ? (
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={resetFilters}
                  startIcon={<RefreshOutlined />}
                  sx={{ height: 55, flex: 1 }}
                >
                  Reset Filters
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleRefresh}
                  startIcon={<CachedOutlinedIcon />}
                  sx={{ height: 55, flex: 1 }}
                  disabled={loadingTests}
                >
                  Refresh Data
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {loadingTests ? (
          <LoadingComponent
            text="Loading Glucose Test Results..."
            spinnerColor="#1e2dfa"
            textColor="#333"
          />
        ) : (
          <>
            <Paper className="space-y-4">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{ backgroundColor: "#f9f9f9" }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", color: "#333" }}
                        >
                          {searchTerm.trim() ||
                          selectedDate ||
                          startDate ||
                          endDate
                            ? `Total Hasil Pencarian: ${totalFiltered} dari ${totalAll} data`
                            : `Total Data Keseluruhan: ${totalAll}`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>No.</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Lab Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Date & Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Glucose Value
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Method</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {glucoseTests.length > 0 ? (
                      glucoseTests.map((test, index) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            {page * rowsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            {test.lab_number || "Undefined"}
                          </TableCell>
                          <TableCell>
                            <DateTimeDisplay dateTime={test.date_time} />
                          </TableCell>
                          <TableCell>
                            {Math.round(parseFloat(test.glucos_value))}
                          </TableCell>
                          <TableCell>{test.unit}</TableCell>
                          <TableCell>
                            {test.metode || "Not specified"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "#6B7280",
                            }}
                          >
                            <SearchOutlined
                              sx={{ fontSize: 40, color: "#9CA3AF", mb: 1 }}
                            />
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              No test results available
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              No glucose tests found for this lab order
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <TablePagination
                  component="div"
                  count={totalRows}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(_e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                />
              </Box>
            </Paper>
            
            {/* Chart Section */}
            {glucoseTests.length > 0 && (
              <>
                <div className="mb-10"></div>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Glucose Level Trend
                  </Typography>
                  <Line data={chartConfig.data} options={chartConfig.options} />
                </Paper>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default LabOrderDetail;