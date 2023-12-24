import React, { memo } from 'react';
import { Menu, MenuItem, Button, Tooltip } from '@mui/material';
import FileOpenIcon from '@mui/icons-material/FileOpen';

interface Props {
  contextMenuPosition: {
    top: number;
    left: number;
  } | null;
  contextMenuItems: ContextMenuItem[];
  setContextMenuItems: React.Dispatch<React.SetStateAction<ContextMenuItem[] | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>;
  setShowPromptDoneFile: React.Dispatch<React.SetStateAction<boolean>>;
}

const { ipcRenderer } = window.api;

const ContextMenu: React.FC<Props> = memo(({
  contextMenuPosition,
  contextMenuItems,
  setContextMenuItems,
  setPromptItem,
  setShowPromptDoneFile,
}) => {
  const handleContextMenuClick = (item: ContextMenuItem) => {
    const { id, todoObject, pathToReveal} = item;
    switch (id) {
      case 'delete':
        setPromptItem(item);
        break;
      case 'copy':
        setContextMenuItems(null);
        ipcRenderer.send('saveToClipboard', todoObject?.string);
        break;
      case 'removeFile':
        setPromptItem(item);
        break;
      case 'revealInFileManager':
        setContextMenuItems(null);
        ipcRenderer.send('revealInFileManager', pathToReveal);
        break;
      default:
        setContextMenuItems(null);
    }
  };

  const handleChangeDoneFilePath = () => {
    setShowPromptDoneFile(true);
  };

  return (
    <>
      <Menu
        open={Boolean(contextMenuPosition)}
        onClose={() => setContextMenuItems(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenuPosition || undefined}
      >
        {contextMenuItems && contextMenuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleContextMenuClick(item)}>
            {item.id === 'changeDoneFilePath' ? (
              <Tooltip placement='right' arrow title={item.doneFilePath || ''}>
                <Button onClick={() => handleChangeDoneFilePath()} startIcon={<FileOpenIcon />}>
                  {item.label}
                </Button>
              </Tooltip>
            ) : (
              item.label
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

export default ContextMenu;
