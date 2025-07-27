import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { FiInfo, FiTrash2 } from "react-icons/fi";
import { PiPencil } from "react-icons/pi";

interface ContextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onViewDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showDetail?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onViewDetail,
  onEdit,
  onDelete,
  showDetail = true,
  showEdit = true,
  showDelete = true,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        elevation: 2, // Mengurangi ketebalan shadow
        sx: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Shadow yang lebih halus
        },
      }}
    >
      {/* Menu Item: View Detail */}
      {showDetail && onViewDetail && (
        <MenuItem
          onClick={() => {
            onViewDetail();
            onClose();
          }}
          className="flex items-center"
        >
          <FiInfo className="mr-2" /> Detail
        </MenuItem>
      )}

      {/* Menu Item: Edit */}
      {showEdit && onEdit && (
        <MenuItem
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="flex items-center"
        >
          <PiPencil className="mr-2" /> Edit
        </MenuItem>
      )}

      {/* Menu Item: Delete */}
      {showDelete && onDelete && (
        <MenuItem
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex items-center"
        >
          <FiTrash2 className="mr-2" /> Delete
        </MenuItem>
      )}
    </Menu>
  );
};

export default ContextMenu;