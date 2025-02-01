import { create } from "zustand";
import { Booking } from "./types";
import { DateRange } from "react-day-picker";

// Define the state's shape
type PropertyState = {
  propertyId: string;
  price: number;
  bookings: Booking[];
  range: DateRange | undefined;
  setProperty: (data: Partial<PropertyState>) => void; // Add setter function
};

// Create the store
export const useProperty = create<PropertyState>((set) => ({
  propertyId: "",
  price: 0,
  bookings: [],
  range: undefined,
  setProperty: (data) => set((state) => ({ ...state, ...data })), // Implement state setter
}));
