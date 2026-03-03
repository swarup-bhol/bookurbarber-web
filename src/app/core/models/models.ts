// ── Enums ─────────────────────────────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'BARBER' | 'ADMIN';
export type ShopStatus = 'PENDING' | 'ACTIVE' | 'DISABLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'RESCHEDULE_REQUESTED';
export type RescheduleStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserInfo {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  role: Role;
  shopId?: number;
  shopName?: string;
  shopStatus?: ShopStatus;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  isNewUser: boolean;
  user: UserInfo;
}

export interface SendOtpRequest   { phone: string; }
export interface VerifyOtpRequest { phone: string; otp: string; fullName?: string; }
export interface LoginRequest     { email: string; password: string; }
export interface RefreshRequest   { refreshToken: string; }
export interface LogoutRequest    { refreshToken?: string; allDevices?: boolean; }

export interface BarberRegisterRequest {
  fullName: string; email: string; password: string; phone: string;
  shopName: string; location: string; city: string; area: string;
  latitude?: number; longitude?: number;
}

// ── API Wrapper ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> { success: boolean; message: string; data: T; }

// ── Shop ──────────────────────────────────────────────────────────────────────

export interface ServiceResponse {
  id: number; serviceName: string; description?: string;
  category: string; price: number; durationMinutes: number;
  icon?: string; enabled: boolean; isCombo: boolean;
  platformFee?: number; barberEarning?: number;
}

export interface ShopResponse {
  id: number; shopName: string; slug: string;
  location: string; city?: string; area?: string;
  latitude?: number; longitude?: number;
  bio?: string; emoji?: string; phone?: string;
  color1?: string; color2?: string;
  status: ShopStatus; plan?: string; open: boolean; seats: number;
  avgRating?: number; totalReviews?: number; totalBookings?: number; monthlyRevenue?: number;
  workDays?: string; openTime?: string; closeTime?: string; slotDurationMinutes?: number;
  subscriptionFee?: number; commissionPercent?: number;
  ownerId?: number; ownerName?: string; ownerEmail?: string; createdAt?: string;
  services?: ServiceResponse[];
  // Employee quick-view
  totalEmployees?: number;
  freeEmployeesNow?: number;
  // computed for UI
  distance?: number;
}

export interface ShopUpdateRequest {
  shopName?: string; location?: string; city?: string; area?: string;
  latitude?: number; longitude?: number; bio?: string; emoji?: string; phone?: string;
  color1?: string; color2?: string; isOpen?: boolean; seats?: number;
  workDays?: string; openTime?: string; closeTime?: string; slotDurationMinutes?: number;
}

export interface ServiceRequest {
  serviceName: string; description?: string; category: string;
  price: number; durationMinutes: number; icon?: string;
  enabled?: boolean; isCombo?: boolean;
}

// ── Employees ─────────────────────────────────────────────────────────────────

export interface EmployeeResponse {
  id: number; shopId: number; name: string; role?: string;
  avatar?: string; phone?: string; bio?: string; specialties?: string;
  active: boolean; displayOrder: number;
  avgRating: number; totalReviews: number; totalBookings: number; totalEarnings?: number;
  currentlyBusy?: boolean; nextAvailableSlot?: string;
}

export interface EmployeeRequest {
  name: string; role?: string; avatar?: string; phone?: string;
  bio?: string; specialties?: string; active?: boolean; displayOrder?: number;
}

export interface EmployeeStatsResponse {
  employeeId: number; employeeName: string; employeeAvatar?: string; employeeRole?: string;
  bookingsToday: number; completedToday: number; earningsToday: number;
  bookingsMonth: number; completedMonth: number; earningsMonth: number;
  totalBookings: number; totalEarnings: number; avgRating: number; totalReviews: number;
  blockedSlotsToday: number;
}

// ── Slot Blocks ───────────────────────────────────────────────────────────────

export interface SlotBlockRequest {
  blockDate: string; slotTime: string; reason?: string; employeeId?: number;
}

export interface SlotBlockRangeRequest {
  blockDate: string; fromTime: string; toTime: string; reason?: string; employeeId?: number;
}

export interface SlotBlockResponse {
  id: number; blockDate: string; slotTime: string;
  reason?: string; blockedBy?: string;
  employeeId?: number; employeeName?: string; employeeAvatar?: string;
}

// ── Slots ─────────────────────────────────────────────────────────────────────

export interface EmployeeSlotStatus {
  employeeId: number; employeeName: string; employeeAvatar?: string;
  available: boolean; blocked: boolean; booked: boolean;
}

export interface SlotInfo {
  time: string; label: string;
  taken: boolean; available: boolean; blockedByOwner: boolean;
  seatsTotal: number; seatsUsed: number; seatsLeft: number;
  employeeStatuses?: EmployeeSlotStatus[];
}

export interface SlotAvailabilityResponse {
  date: string; slots: SlotInfo[]; totalSlots: number; availableSlots: number;
}

// ── Location ──────────────────────────────────────────────────────────────────

export interface LocationMeta { cities: string[]; areasByCity: Record<string, string[]>; }

// ── Booking ───────────────────────────────────────────────────────────────────

export interface BookingRequest {
  shopId: number; serviceIds: number[]; bookingDate: string; slotTime: string;
  seats?: number; employeeId?: number;
}

export interface BookingResponse {
  id: number; shopId: number; shopName: string; shopEmoji?: string;
  customerId: number; customerName: string; customerPhone: string;
  employeeId?: number; employeeName?: string; employeeAvatar?: string;
  employeeRole?: string; employeeSnapshot?: string; employeeRating?: number;
  servicesSnapshot: string; bookingDate: string; slotTime: string;
  durationMinutes: number; seats: number; totalAmount: number;
  platformFee?: number; barberEarning?: number;
  status: BookingStatus; cancelReason?: string; rating?: number; review?: string;
  rescheduleDate?: string; rescheduleTime?: string;
  rescheduleReason?: string; rescheduleStatus?: RescheduleStatus;
  createdAt: string;
}

export interface RatingRequest { rating: number; review?: string; employeeRating?: number; }
export interface RescheduleRequest { newDate: string; newTime: string; reason: string; }
export interface RescheduleResponseRequest { accept: boolean; }

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalBookings: number; pendingBookings: number;
  confirmedBookings: number; completedBookings: number;
  totalRevenue: number; totalCommission: number; barberEarnings: number;
  totalShops?: number; activeShops?: number; pendingShops?: number; totalCustomers?: number;
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface BubSession {
  accessToken: string; refreshToken: string; user: UserInfo;
}
