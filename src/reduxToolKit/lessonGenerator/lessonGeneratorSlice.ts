import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCurricula,
  generateLesson,
  fetchHistory,
  fetchLessonDetail,
  fetchWallet,
  fetchTransactions,
  topUpWallet,
} from "./lessonGeneratorThunks";

interface WalletState {
  balance: number | null;
  isLowBalance: boolean;
  remainingGenerations: number | null;
  alert: string | null;
  transactions: any[];
  totalSpent: number;
  totalPurchased: number;
  totalRefunded: number;
  loadingTransactions: boolean;
  toppingUp: boolean;
}

interface LessonGeneratorState {
  curricula: any[];
  history: any[];
  currentLesson: any | null;
  wallet: WalletState;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: LessonGeneratorState = {
  curricula: [],
  history: [],
  currentLesson: null,
  wallet: {
    balance: null,
    isLowBalance: false,
    remainingGenerations: null,
    alert: null,
    transactions: [],
    totalSpent: 0,
    totalPurchased: 0,
    totalRefunded: 0,
    loadingTransactions: false,
    toppingUp: false,
  },
  loading: false,
  generating: false,
  error: null,
};

/** Shared helper — recalculate derived wallet fields from a balance value */
function applyBalance(wallet: WalletState, balance: number) {
  const remaining = Math.floor(balance / 5);
  wallet.balance = balance;
  wallet.remainingGenerations = remaining;
  wallet.isLowBalance = balance < 15;
  wallet.alert = balance < 15
    ? `Low balance: ${remaining} generation${remaining !== 1 ? "s" : ""} remaining.`
    : null;
}

const lessonGeneratorSlice = createSlice({
  name: "lessonGenerator",
  initialState,
  reducers: {
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setWalletBalance: (state, action: PayloadAction<number>) => {
      applyBalance(state.wallet, action.payload);
    },
  },
  extraReducers: (builder) => {
    // ── Curricula ──────────────────────────────────────────────────────────
    builder.addCase(fetchCurricula.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurricula.fulfilled, (state, action) => {
      state.loading = false;
      state.curricula = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchCurricula.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ── Generate Lesson ────────────────────────────────────────────────────
    builder.addCase(generateLesson.pending, (state) => {
      state.generating = true;
      state.error = null;
    });
    builder.addCase(generateLesson.fulfilled, (state, action) => {
      state.generating = false;
      state.currentLesson = action.payload;
      // Prepend slim entry (no content blob) to history
      const { content: _content, ...historyItem } = action.payload;
      state.history = [historyItem, ...state.history];
      // Update wallet balance from generation response — no extra API call needed
      if (typeof action.payload.walletBalance === "number") {
        applyBalance(state.wallet, action.payload.walletBalance);
      }
    });
    builder.addCase(generateLesson.rejected, (state, action: PayloadAction<any>) => {
      state.generating = false;
      state.error = action.payload;
    });

    // ── History ────────────────────────────────────────────────────────────
    builder.addCase(fetchHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.history = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchHistory.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ── Lesson Detail ──────────────────────────────────────────────────────
    builder.addCase(fetchLessonDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLessonDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentLesson = action.payload;
    });
    builder.addCase(fetchLessonDetail.rejected, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ── Wallet Balance ─────────────────────────────────────────────────────
    builder.addCase(fetchWallet.fulfilled, (state, action) => {
      const data = action.payload;
      if (!data) return;
      applyBalance(state.wallet, data.balance ?? 0);
      // override alert with server message if provided
      if (data.alert) state.wallet.alert = data.alert;
    });
    // pending / rejected are silent — non-blocking

    // ── Transactions ───────────────────────────────────────────────────────
    builder.addCase(fetchTransactions.pending, (state) => {
      state.wallet.loadingTransactions = true;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.wallet.loadingTransactions = false;
      const data = action.payload;
      state.wallet.transactions = data?.transactions ?? [];
      state.wallet.totalSpent = data?.totalSpent ?? 0;
      state.wallet.totalPurchased = data?.totalPurchased ?? 0;
      state.wallet.totalRefunded = data?.totalRefunded ?? 0;
      // Sync balance if server sends an updated one
      if (typeof data?.balance === "number") {
        applyBalance(state.wallet, data.balance);
      }
    });
    builder.addCase(fetchTransactions.rejected, (state) => {
      state.wallet.loadingTransactions = false;
    });

    // ── Top Up ─────────────────────────────────────────────────────────────
    builder.addCase(topUpWallet.pending, (state) => {
      state.wallet.toppingUp = true;
    });
    builder.addCase(topUpWallet.fulfilled, (state, action) => {
      state.wallet.toppingUp = false;
      const data = action.payload;
      if (typeof data?.balance === "number") {
        applyBalance(state.wallet, data.balance);
      }
    });
    builder.addCase(topUpWallet.rejected, (state) => {
      state.wallet.toppingUp = false;
    });
  },
});

export const { clearCurrentLesson, clearError, setWalletBalance } = lessonGeneratorSlice.actions;
export default lessonGeneratorSlice.reducer;
