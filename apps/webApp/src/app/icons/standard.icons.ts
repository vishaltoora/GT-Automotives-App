/**
 * Centralized icon exports for single source of truth
 * Import all Material-UI icons here and re-export them
 * This ensures consistent icon usage across the application
 */

// Navigation & UI Icons
export { 
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Action Icons
export {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Business Icons
export {
  Print as PrintIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

// Status & Feedback Icons
export {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

// Automotive Specific Icons
export {
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

// Document & Data Icons
export {
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  RequestQuote as QuoteIcon,
  Assessment as ReportIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

// User & Account Icons
export {
  Person as PersonIcon,
  Group as GroupIcon,
  AccountCircle as AccountIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

// File & Media Icons
export {
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

// Dashboard & Analytics Icons
export {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as ChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

// Communication Icons
export {
  ChatBubble as ChatIcon,
  Mail as MailIcon,
  Call as CallIcon,
  Message as MessageIcon,
} from '@mui/icons-material';

// System Icons
export {
  Security as SecurityIcon,
  Backup as BackupIcon,
  CloudDone as CloudDoneIcon,
  Sync as SyncIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';

// Navigation Menu Icons
export {
  Home as HomeIcon,
  Store as StoreIcon,
  ShoppingCart as CartIcon,
  Receipt as InvoiceIcon,
  People as CustomersIcon,
} from '@mui/icons-material';

// Export commonly used icon combinations
// Import the renamed icons to use in Icons object
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  RequestQuote as QuoteIcon,
  Receipt as ReceiptIcon,
  DirectionsCar as CarIcon,
  Build as ServiceIcon,
} from '@mui/icons-material';

export const Icons = {
  // Navigation
  navigation: {
    menu: MenuIcon,
    close: CloseIcon,
    back: ArrowBackIcon,
    forward: ArrowForwardIcon,
    expandMore: ExpandMoreIcon,
    expandLess: ExpandLessIcon,
  },
  
  // Actions
  actions: {
    add: AddIcon,
    edit: EditIcon,
    delete: DeleteIcon,
    save: SaveIcon,
    cancel: CancelIcon,
    search: SearchIcon,
    filter: FilterIcon,
    clear: ClearIcon,
  },
  
  // Status
  status: {
    success: CheckCircleIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
  },
  
  // Business
  business: {
    print: PrintIcon,
    email: EmailIcon,
    phone: PhoneIcon,
    quote: QuoteIcon,
    invoice: ReceiptIcon,
    car: CarIcon,
    service: ServiceIcon,
  },
} as const;

// Type exports for TypeScript support
export type IconComponent = typeof AddIcon;
export type IconName = keyof typeof Icons.actions | keyof typeof Icons.navigation | keyof typeof Icons.status | keyof typeof Icons.business;