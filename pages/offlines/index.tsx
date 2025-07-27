import { Cast } from "@mui/icons-material";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import PatientForm from "../patients/page";
import { getRequest } from "../../utils/apiClient";
import LoadingComponent from "@/components/LoadingComponent";

interface GlucoseReading {
  timestamp: Date;
  formattedTimestamp?: string;
  glucoseValue: number;
  unit: string;
  mealContext?: string;
  sequenceNumber?: number;
  contextSequenceNumber?: number;
  value?: string;
}

const OfflineForm: React.FC = () => {
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("authToken"); // Ambil token dari cookies

      // Cek apakah token ada
      if (!token) {
        Cookies.remove("authToken"); // Pastikan token dihapus
        router.replace("/login");
        return;
      }

      try {
        // Kirim request untuk verifikasi token
        const response = await getRequest("/auth/verify-token");

        if (response.status === "success") {
          const { id, name, email } = response.data;
          console.log("User :", { id, name, email });
        } else {
          // Jika respons tidak success, berarti token tidak valid
          throw new Error("Token verification failed");
        }
      } catch (error) {
        // Handle error (token expired atau tidak valid)
        console.error("Token verification error:", error);
        Cookies.remove("authToken");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router]); // Tambahkan router sebagai dependency

  return (
    <>
      <Head>
        <title>Offline</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>
      <div className="flex justify-start items-center gap-2 mb-3">
        <Cast className="h-5 w-5 text-black" />
        <h2 className="text-xl font-semibold text-black">
          {/* Device Control Contour Plus Elite */}
          Offline
        </h2>
      </div>

      {/* Status Information */}
      <div className="flex w-full mx-auto space-x-3 bg-orange-200 rounded-md">
        <div className="p-4 rounded-md shadow-md flex items-center justify-between mx-auto w-full">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-amber-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-amber-700">
                Perhatian
              </span>
              <p className="text-black">
                Input manual data hasil pemeriksaan hanya dilakukan jika adanya
                koneksi error alat dengan aplikasi atau kendala lainnya yang
                belum terselesaikan. Sehingga mengharuskan input data hasil
                secara manual. Terima Kasih...
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingComponent
          text="Loading Data Patients..."
          spinnerColor="#1e2dfa"
          textColor="#333"
        />
      ) : (
        <>
          <PatientForm
            glucoseReadings={glucoseReadings}
            onGlucoseTestSaved={() => {
              setGlucoseReadings([]);
            }}
          />
        </>
      )}

      {/* Tabel Pembacaan Glukosa */}
      {glucoseReadings.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Glucose Result
          </h3>
          <table className="min-w-full bg-white border border-gray-300 rounded shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2 border">No</th>
                <th className="px-4 py-2 border">Tanggal & Waktu</th>
                <th className="px-4 py-2 border">Nilai Glukosa</th>
                <th className="px-4 py-2 border">Satuan</th>
              </tr>
            </thead>
            <tbody>
              {glucoseReadings.map((reading, index) => (
                <tr key={index} className="text-center hover:bg-gray-100">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">
                    {reading.formattedTimestamp}
                  </td>
                  <td className="px-4 py-2 border">{reading.glucoseValue}</td>
                  <td className="px-4 py-2 border">{reading.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default OfflineForm;
