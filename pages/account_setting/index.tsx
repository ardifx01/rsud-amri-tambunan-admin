import Head from "next/head";
import {
  CheckOutlined,
  Close,
  ManageAccountsOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteRequest, getRequest } from "@/utils/apiClient";
import { FiInfo, FiTrash2 } from "react-icons/fi";
import { CgMoreVertical } from "react-icons/cg";
import { PiPencil } from "react-icons/pi";
import LoadingComponent from "@/components/LoadingComponent";
import SearchIcon from "@mui/icons-material/Search";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DynamicDialog from "@/components/DynamicDialog";
import { showDeleteToast, showErrorToast } from "@/utils/notif";

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

const AccountSettingPage = () => {
  const router = useRouter();
  const {
    page: queryPage = "1",
    limit: queryLimit = "10",
    search: querySearch = "",
  } = router.query as { page?: string; limit?: string; search?: string };
  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [page, setPage] = useState(Number(queryPage) - 1); // 0-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(Number(queryLimit));
  const [totalUser, setTotalUser] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Untuk menu dropdown
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRequest(
        `/api/users?page=${
          page + 1
        }&limit=${rowsPerPage}&search=${encodeURIComponent(searchTerm)}`
      );

      console.log("API Response:", response.data); // Debugging log

      if (response.status === "success") {
        // Match the actual API response structure
        const { users, pagination } = response.data;

        if (Array.isArray(users) && users.length > 0) {
          const formattedUsers = users.map((item) => ({
            id: item.user?.id ?? 0,
            name: item.user?.name ?? "Unknown",
            email: item.user?.email ?? "Unknown",
            roles: Array.isArray(item.roles)
              ? item.roles.map((role: any) => ({
                  id: role.id ?? 0,
                  name: role.name ?? "No Role",
                  description: role.description ?? "",
                }))
              : [],
            permissions: Array.isArray(item.permissions)
              ? item.permissions.map((permission: any) => ({
                  id: permission.id ?? 0,
                  name: permission.name ?? "No Permission",
                  description: permission.description ?? "",
                }))
              : [],
          }));

          setUserData(formattedUsers);
          setTotalUser(pagination?.totalUsers || 0);
        } else {
          console.warn("Users array is empty or invalid:", response.data);
          setUserData([]); // Ensure state isn't undefined
        }
      } else {
        console.error("API returned an error status:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching users data:", error);
      setUserData([]); // If error, still set state to avoid undefined
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  // Use useEffect to Fetch Data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("UserData Updated:", userData);
  }, [userData]);

  // Filter Data with useMemo
  const filteredUsers = useMemo(() => {
    console.log("SearchTerm:", searchTerm);
    console.log("FilteredUsers Computed From:", userData);

    if (!searchTerm) return userData; // If no search, show all data

    return userData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userData, searchTerm]);
  console.log("Filtered Users:", filteredUsers);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset ke halaman pertama saat pencarian berubah

    // Update URL dengan search term baru
    router.push({
      pathname: "/dashboard",
      query: {
        menu: "account_setting",
        page: 1,
        limit: rowsPerPage,
        search: newSearchTerm,
      },
    });
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    users: User
  ) => {
    console.log("Selected User:", users); // Debugging log
    if (!users || !users.id) {
      console.error("Invalid user object passed to handleMenuClick.");
      return;
    }
    setAnchorEl(event.currentTarget);
    setSelectedUser(users);
  };

  const handleViewDetail = () => {
    if (selectedUser && selectedUser.id) {
      router.push(`/dashboard?menu=user_detail&id=${selectedUser.id}`);
    } else {
      console.error("Selected user or user ID is invalid.");
    }
    handleCloseMenu(); // Menutup menu setelah klik
  };

  // Updated handleEdit function
  const handleEdit = () => {
    if (selectedUser && selectedUser.id) {
      router.push(`/dashboard?menu=edit_account_setting&id=${selectedUser.id}`);
    } else {
      console.error("Selected user or user ID is invalid.");
      showErrorToast("Please select a user first.");
    }
    handleCloseMenu();
  };

  const handleDeleteClick: () => void = () => {
    if (!selectedUser) {
      console.error("No user selected for deletion.");
      showErrorToast("Please select a user first.");
      return;
    }

    console.log("Opening delete confirmation for user ID:", selectedUser.id);
    setOpen(true); // Buka dialog konfirmasi
    setAnchorEl(null); // Tutup menu dropdown
  };

  const handleDelete = async () => {
      if (!selectedUser) {
        console.error("No user selected for deletion.");
        showErrorToast("No user selected for deletion.");
        return;
      }
  
      console.log("Deleting User with ID:", selectedUser.id);
  
      try {
        const response = await deleteRequest(
          `/api/users/${selectedUser.id}`
        );
        if (response.status === "success") {
          showDeleteToast("User deleted successfully!");
          fetchData(); // Refresh data pasien
        } else {
          console.error("Failed to delete user. Response:", response);
          showErrorToast(response.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        showErrorToast("An unexpected error occurred");
      } finally {
        setOpen(false); // Tutup dialog konfirmasi
      }
    };

  const handleAdd = () => {
    router.push(`/dashboard?menu=create_account_setting&add=true`);
  };

  return (
    <>
      <Head>
        <title>User Account</title>
        <link rel="icon" href="/assets/images/icon/fanscosa-icon.png" />
      </Head>

      <div className="flex justify-start items-center gap-2">
        <ManageAccountsOutlined className="h-7 w-7 text-black" />
        <h2 className="text-xl font-semibold text-black">User Account</h2>
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
            sx={{ flex: 3 }}
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            startIcon={<AddOutlinedIcon />}
            sx={{ height: 55, flex: 1, mt: 2 }}
          >
            Add New User
          </Button>
        </Box>
      </Grid>

      {loading ? (
        <LoadingComponent
          text="Loading Data User..."
          spinnerColor="#1e2dfa"
          textColor="#333"
        />
      ) : (
        <Paper>
          <TableContainer sx={{ maxHeight: 650, overflowY: "auto" }}>
            <Table stickyHeader aria-label="user management table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F9FAFB",
                      color: "#374151",
                      borderBottom: "2px solid #E5E7EB",
                      width: "5%",
                    }}
                  >
                    No.
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F9FAFB",
                      color: "#374151",
                      borderBottom: "2px solid #E5E7EB",
                      width: "20%",
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F9FAFB",
                      color: "#374151",
                      borderBottom: "2px solid #E5E7EB",
                      width: "20%",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F9FAFB",
                      color: "#374151",
                      borderBottom: "2px solid #E5E7EB",
                      width: "20%",
                    }}
                  >
                    Roles
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F9FAFB",
                      color: "#374151",
                      borderBottom: "2px solid #E5E7EB",
                      width: "10%",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#FAFAFA" },
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#F3F4F6" },
                      }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color="#111827"
                        >
                          {user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#4B5563">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.roles.map((role) => (
                          <Chip
                            key={role.id}
                            label={role.name}
                            size="small"
                            sx={{
                              backgroundColor: "#DBEAFE",
                              color: "#1D4ED8",
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              borderRadius: "4px",
                              "&:hover": { backgroundColor: "#BFDBFE" },
                            }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleMenuClick(e, user)}>
                          <CgMoreVertical />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(
                            anchorEl && selectedUser?.id === user.id
                          )}
                          onClose={handleCloseMenu}
                        >
                          <MenuItem
                            onClick={() => {
                              handleViewDetail();
                              handleCloseMenu(); // Menutup menu setelah klik
                            }}
                            className="flex items-center"
                          >
                            <FiInfo className="mr-2" /> Detail
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              handleEdit();
                            }}
                            className="flex items-center"
                          >
                            <PiPencil className="mr-2" /> Edit
                          </MenuItem>

                          <MenuItem
                            onClick={handleDeleteClick}
                            className="flex items-center"
                          >
                            <FiTrash2 className="mr-2" /> Delete
                          </MenuItem>
                        </Menu>
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
                        <SearchIcon
                          sx={{ fontSize: 40, color: "#9CA3AF", mb: 1 }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          No data available
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Try adjusting your search or filter to find what youre
                          looking for
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
            <Typography
              variant="body2"
              sx={{
                color: "#555",
                fontWeight: "bold",
              }}
            >
              Showing {page * rowsPerPage + 1} -{" "}
              {Math.min((page + 1) * rowsPerPage, totalUser)} of {totalUser}{" "}
              results
            </Typography>

            <TablePagination
              count={totalUser}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
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
      )}

      <DynamicDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        message="Are you sure you want to delete this item?"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        iconNotif={<FiTrash2 className="w-7 h-7 text-red-600" />}
        iconButton={<CheckOutlined className="w-10 h-10 text-red-600" />}
        confirmButtonColor="error"
      />
    </>
  );
};

export default AccountSettingPage;