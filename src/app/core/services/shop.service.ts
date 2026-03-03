import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, ShopResponse, SlotAvailabilityResponse, LocationMeta,
  ServiceRequest, ServiceResponse, ShopUpdateRequest, DashboardStats,
  EmployeeRequest, EmployeeResponse, EmployeeStatsResponse,
  SlotBlockRequest, SlotBlockRangeRequest, SlotBlockResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ShopService {

  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Public (no auth) ──────────────────────────────────────────────────────

  getPublicShops(q?: string, city?: string, area?: string): Observable<ApiResponse<ShopResponse[]>> {
    let params = new HttpParams();
    if (q)    params = params.set('q', q);
    if (city) params = params.set('city', city);
    if (area) params = params.set('area', area);
    return this.http.get<ApiResponse<ShopResponse[]>>(`${this.api}/shops/public`, { params });
  }

  getShopById(id: number): Observable<ApiResponse<ShopResponse>> {
    return this.http.get<ApiResponse<ShopResponse>>(`${this.api}/shops/public/${id}`);
  }

  getShopBySlug(slug: string): Observable<ApiResponse<ShopResponse>> {
    return this.http.get<ApiResponse<ShopResponse>>(`${this.api}/shops/public/slug/${slug}`);
  }

  getSlots(shopId: number, date: string, employeeId?: number): Observable<ApiResponse<SlotAvailabilityResponse>> {
    let params = new HttpParams().set('date', date);
    if (employeeId) params = params.set('employeeId', employeeId);
    return this.http.get<ApiResponse<SlotAvailabilityResponse>>(`${this.api}/shops/${shopId}/slots`, { params });
  }

  getPublicEmployees(shopId: number): Observable<ApiResponse<EmployeeResponse[]>> {
    return this.http.get<ApiResponse<EmployeeResponse[]>>(`${this.api}/shops/${shopId}/employees`);
  }

  getLocationMeta(): Observable<ApiResponse<LocationMeta>> {
    return this.http.get<ApiResponse<LocationMeta>>(`${this.api}/location/meta`);
  }

  // ── Barber — Shop ─────────────────────────────────────────────────────────

  getMyShop(): Observable<ApiResponse<ShopResponse>> {
    return this.http.get<ApiResponse<ShopResponse>>(`${this.api}/barber/shop`);
  }

  updateMyShop(req: ShopUpdateRequest): Observable<ApiResponse<ShopResponse>> {
    return this.http.patch<ApiResponse<ShopResponse>>(`${this.api}/barber/shop`, req);
  }

  // ── Barber — Services ─────────────────────────────────────────────────────

  addService(req: ServiceRequest): Observable<ApiResponse<ServiceResponse>> {
    return this.http.post<ApiResponse<ServiceResponse>>(`${this.api}/barber/services`, req);
  }

  updateService(id: number, req: ServiceRequest): Observable<ApiResponse<ServiceResponse>> {
    return this.http.put<ApiResponse<ServiceResponse>>(`${this.api}/barber/services/${id}`, req);
  }

  toggleService(id: number): Observable<ApiResponse<ServiceResponse>> {
    return this.http.patch<ApiResponse<ServiceResponse>>(`${this.api}/barber/services/${id}/toggle`, {});
  }

  deleteService(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/barber/services/${id}`);
  }

  // ── Barber — Employees ────────────────────────────────────────────────────

  getMyEmployees(): Observable<ApiResponse<EmployeeResponse[]>> {
    return this.http.get<ApiResponse<EmployeeResponse[]>>(`${this.api}/barber/employees`);
  }

  addEmployee(req: EmployeeRequest): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.post<ApiResponse<EmployeeResponse>>(`${this.api}/barber/employees`, req);
  }

  updateEmployee(id: number, req: EmployeeRequest): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.put<ApiResponse<EmployeeResponse>>(`${this.api}/barber/employees/${id}`, req);
  }

  toggleEmployee(id: number): Observable<ApiResponse<EmployeeResponse>> {
    return this.http.patch<ApiResponse<EmployeeResponse>>(`${this.api}/barber/employees/${id}/toggle`, {});
  }

  deleteEmployee(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/barber/employees/${id}`);
  }

  getEmployeeReport(date?: string): Observable<ApiResponse<EmployeeStatsResponse[]>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<EmployeeStatsResponse[]>>(`${this.api}/barber/employees/report`, { params });
  }

  // ── Barber — Slot Blocking ────────────────────────────────────────────────

  getBlockedSlots(date: string): Observable<ApiResponse<SlotBlockResponse[]>> {
    return this.http.get<ApiResponse<SlotBlockResponse[]>>(`${this.api}/barber/slots/blocked`, { params: { date } });
  }

  blockSlot(req: SlotBlockRequest): Observable<ApiResponse<SlotBlockResponse>> {
    return this.http.post<ApiResponse<SlotBlockResponse>>(`${this.api}/barber/slots/block`, req);
  }

  blockRange(req: SlotBlockRangeRequest): Observable<ApiResponse<SlotBlockResponse[]>> {
    return this.http.post<ApiResponse<SlotBlockResponse[]>>(`${this.api}/barber/slots/block-range`, req);
  }

  unblockSlot(date: string, time: string, employeeId?: number): Observable<ApiResponse<void>> {
    let params = new HttpParams().set('date', date).set('time', time);
    if (employeeId) params = params.set('employeeId', employeeId);
    return this.http.delete<ApiResponse<void>>(`${this.api}/barber/slots/unblock`, { params });
  }

  unblockAllForEmployee(date: string, employeeId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/barber/slots/unblock-all`, {
      params: new HttpParams().set('date', date).set('employeeId', employeeId)
    });
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  adminGetAllShops(): Observable<ApiResponse<ShopResponse[]>> {
    return this.http.get<ApiResponse<ShopResponse[]>>(`${this.api}/admin/shops`);
  }

  adminApprove(id: number): Observable<ApiResponse<ShopResponse>> {
    return this.http.post<ApiResponse<ShopResponse>>(`${this.api}/admin/shops/${id}/approve`, {});
  }

  adminDisable(id: number): Observable<ApiResponse<ShopResponse>> {
    return this.http.post<ApiResponse<ShopResponse>>(`${this.api}/admin/shops/${id}/disable`, {});
  }

  adminEnable(id: number): Observable<ApiResponse<ShopResponse>> {
    return this.http.post<ApiResponse<ShopResponse>>(`${this.api}/admin/shops/${id}/enable`, {});
  }

  adminSetCommission(id: number, percent: number): Observable<ApiResponse<ShopResponse>> {
    return this.http.patch<ApiResponse<ShopResponse>>(`${this.api}/admin/shops/${id}/commission`, { percent });
  }
}
