"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import isBetween from "dayjs/plugin/isBetween";
import { getRequest } from "@/utils/apiClient";
import { useRouter } from "next/router";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import { ShowChart } from "@mui/icons-material";
import DevicesIcon from "@mui/icons-material/Devices";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
// import { SyncLog } from "@/types";
// import GoogleMap from "../../components/GoogleMaps";
dayjs.extend(isBetween);

interface DeviceStatus {
  id: number;
  deviceId: string;
  timestamp: string;
  status: "connected" | "disconnected";
  details: string;
  deviceType: string;
}

interface Setting {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  maps: string;
  lat: string;
  lng: string;
  created_at: string;
  updated_at: string;
}

// Dynamically import ReactApexChart with SSR disabled
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const DashboardPage = () => {
  const router = useRouter();
  const [totalPatients, setTotalPatients] = useState(0);
  const [statusConnection, setStatusConnection] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalIsvalidationDone, setTotalIsValidationDone] = useState(0);
  const [totalIsvalidationNotDone, setTotalIsValidationNotDone] = useState(0);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [setting, setSetting] = useState<Setting | null>(null);

  const yearOptions = useMemo(() => {
    return Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i);
  }, [currentYear]);

  const [chartSeries, setChartSeries] = useState([
    {
      name: "Test Results",
      data: new Array(12).fill(0), // Initialize with 0 for all months
    },
  ]);

  //   const [logs, setLogs] = useState<SyncLog[]>([]);
  // const [lastLog, setLastLog] = useState<SyncLog | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          router.replace("/login");
          return;
        }

        const [
          patientsRes,
          resultsRes,
          validationDoneRes,
          validationNotDoneRes,
          glucoseTestResultsRes,
          statusConnectionRes,
          settingRes,
        ] = await Promise.all([
          getRequest("/api/patients/counts"),
          getRequest("/api/test-glucosa/counts_total_results"),
          getRequest("/api/test-glucosa/counts_is_validation_done"),
          getRequest("/api/test-glucosa/counts_is_validation_not_done"),
          getRequest(
            `/api/test-glucosa/counts_total_results_month?year=${selectedYear}`
          ),
          getRequest("/api/connection-status/all-devices-status"),
          getRequest("/api/setting"),
        ]);

        // console.log("settingRes:", settingRes);
        // console.log("settingRes status:", settingRes.status);
        // console.log("settingRes data:", settingRes.data);

        if (
          patientsRes.status === "success" &&
          typeof patientsRes.data === "number"
        ) {
          setTotalPatients(patientsRes.data);
        }

        if (
          resultsRes.status === "success" &&
          typeof resultsRes.data === "number"
        ) {
          setTotalResults(resultsRes.data);
        }

        if (
          validationDoneRes.status === "success" &&
          typeof validationDoneRes.data === "number"
        ) {
          setTotalIsValidationDone(validationDoneRes.data);
        }

        if (
          validationNotDoneRes.status === "success" &&
          typeof validationNotDoneRes.data === "number"
        ) {
          setTotalIsValidationNotDone(validationNotDoneRes.data);
        }

        if (settingRes.status === "success") {
          setSetting(settingRes.data);
        }

        if (
          glucoseTestResultsRes.status === "success" &&
          Array.isArray(glucoseTestResultsRes.data)
        ) {
          const monthlyData = new Array(12).fill(0);
          glucoseTestResultsRes.data.forEach(
            (item: { month: number; total: number }) => {
              monthlyData[item.month - 1] = item.total;
            }
          );

          setChartSeries([{ name: "Test Results", data: monthlyData }]);
        }

        if (
          statusConnectionRes.status === "Success" &&
          Array.isArray(statusConnectionRes.data)
        ) {
          setStatusConnection(statusConnectionRes.data);
        } else {
          console.error("Unexpected API response:", statusConnectionRes);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Panggil fetchData pertama kali
    fetchData();

    // Auto-refresh setiap 3 detik
    const intervalId = setInterval(fetchData, 3000);

    // Cleanup interval saat komponen di-unmount
    return () => clearInterval(intervalId);
  }, [selectedYear, router]);

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(Number(event.target.value));
  };

  const zoomLevel: number = 17;
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>Loading Map...</p>,
        ssr: false,
      }),
    []
  );
  const location: [number, number] = [
    setting?.lat ? Number(setting.lat) : 0,
    setting?.lng ? Number(setting.lng) : 0,
  ];

  // Explicitly typed chart options
  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 10,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      title: {
        text: "Glucose Test Results",
      },
    },
    fill: {
      opacity: 1,
      colors: ["#3B82F6"],
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " Test Results";
        },
      },
    },
    title: {
      text: `Glucose Test Results for ${selectedYear}`,
      align: "center",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
  };

  const cardStats = [
    {
      icon: (
        <div className="h-20 w-20 flex items-center bg-blue-300 border-none p-3 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-blue-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      ),
      title: "Patients",
      value: totalPatients.toString(),
      change: "",
    },
    {
      icon: (
        <div className="h-20 w-20 flex items-center bg-green-300 border-none p-3 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-green-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
      title: "Glucosa Test Results",
      value: totalResults.toString(),
      change: "",
    },
    {
      icon: (
        <div className="h-20 w-20 flex items-center bg-purple-300 border-none p-3 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-purple-900 items-center"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              fill="none"
            />
            <path
              d="M9 12l2 2 4-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              fill="none"
            />
          </svg>
        </div>
      ),
      title: "Validation Test Results",
      value:
        totalIsvalidationDone.toString() +
        "/" +
        totalIsvalidationNotDone.toString(),
      change: "",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-4 flex items-center"
            >
              <div className="mr-4">{stat.icon}</div>
              <div>
                <p className="text-gray-900 text-sm">{stat.title}</p>
                <div className="flex items-center">
                  <h3 className="text-xl font-bold mr-2 text-black">
                    {stat.value}
                  </h3>
                  <span
                    className={`text-xs ${
                      stat.change.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Patient Admission Chart */}
        <div className="bg-white shadow-md rounded-lg p-4 md:col-span-2">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <EventAvailableOutlinedIcon className="text-black" />
              <Typography variant="h6" component="h2" className="text-black">
                Monthly Glucose Test Results
              </Typography>
            </Box>
            <FormControl
              variant="outlined"
              size="small"
              style={{ minWidth: 120 }}
            >
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                onChange={handleYearChange}
                label="Year"
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <div id="chart" className="text-black">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={350}
            />
          </div>
        </div>

        {/* Recent Connection Status */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <DevicesIcon className="text-black" />
              <h3 className="text-xl font-semibold text-black">
                Status Device
              </h3>
            </div>
            <Divider />
          </div>

          {loading ? (
            <p className="text-center text-black text-sm animate-pulse">
              Loading...
            </p>
          ) : (
            <div className="space-y-4">
              {statusConnection.map((device) => {
                // Format tanggal dan waktu yang lebih lengkap
                const formatDateTime = (timestamp: string | number | Date) => {
                  const date = new Date(timestamp);
                  const options: Intl.DateTimeFormatOptions = {
                    weekday: "short", // "short" | "long" | "narrow"
                    year: "numeric", // "numeric" | "2-digit"
                    month: "short", // "short" | "long" | "narrow" | "numeric" | "2-digit"
                    day: "2-digit", // "numeric" | "2-digit"
                    hour: "2-digit", // "numeric" | "2-digit"
                    minute: "2-digit", // "numeric" | "2-digit"
                    second: "2-digit", // "numeric" | "2-digit"
                    hour12: false, // boolean
                  };
                  return date.toLocaleString("id-ID", options);
                };

                return (
                  <div
                    key={device.id}
                    className="flex items-center bg-gray-200 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="min-w-0 mr-4">
                      <span className="text-xs text-gray-600 block">
                        {formatDateTime(device.timestamp)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black">
                        <span className="font-medium">{device.deviceType}</span>{" "}
                        (
                        <span className="text-gray-600">{device.deviceId}</span>
                        ) -{" "}
                        <strong
                          className={`${
                            device.status === "connected"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {device.status === "connected"
                            ? "Connected"
                            : "Disconnected"}
                        </strong>
                      </p>
                      {device.details && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {device.details}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {device.status === "connected" ? (
                        <CheckCircleOutlineOutlinedIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <CancelOutlinedIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="hidden">{setting?.name}</div>
      </div>

      <div className="grid grid-cols-1 mt-5 shadow-md">
        <div className="bg-white shadow-md rounded-lg p-4 h-150 md:h-[350px]">
          <Map center={location} zoom={zoomLevel} />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
