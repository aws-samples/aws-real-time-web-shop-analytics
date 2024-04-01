import { create } from 'zustand'

const useEventStore = create((set) => ({
    events: [],
    addEvent: (event) => {
      set((state) => ({
        events: [
          ...state.events, 
          event
        ],
      }));
    }
}));

export default useEventStore;
