//+------------------------------------------------------------------+
//|  Bridge_Integration_Example.mq5                                  |
//|  วิธีใช้ Bridge Validator ในการตรวจสอบการเชื่อมโยง             |
//+------------------------------------------------------------------+
#property copyright "Integration Example"
#property version   "1.00"

#include "Bridge_Validator.mqh"
#include "MarketContext.mqh"

// ── Global Validator Instance ────────────────────────────────────
CBridgeValidator g_validator;
SMarketContext   g_context;
int              g_validator_handle = INVALID_HANDLE;

//+------------------------------------------------------------------+
int OnInit() {
   // Initialize Bridge Validator
   // alert_ms = 100 → ถ้าล่าช้า > 100ms จะแจ้งเตือน
   g_validator = CBridgeValidator(&g_context, 100);

   Print("[Bridge_Integration] Validator initialized with 100ms alert threshold");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnTick() {
   // ═══════════════════════════════════════════════════════════════
   // 1. Simulate data update from .mqh library
   // (ในแอปพลิเคชันจริง จะมาจาก Library Bridge)
   // ═══════════════════════════════════════════════════════════════
   SimulateContextUpdate();

   // ═══════════════════════════════════════════════════════════════
   // 2. RUN VALIDATION — ตรวจสอบการเชื่อมโยง
   // ═══════════════════════════════════════════════════════════════
   static int validation_ticker = 0;
   validation_ticker++;

   // ตรวจสอบทุก 10 ticks (เพื่อไม่ให้หนักเกินไป)
   if(validation_ticker >= 10) {
      ENUM_LINK_STATUS status = g_validator.ValidateAllLinks();
      validation_ticker = 0;

      // ─────────────────────────────────────────────────────────────
      // 3. React to validation result
      // ─────────────────────────────────────────────────────────────
      if(status == LINK_HEALTHY) {
         // ✅ ทุกอย่างสมบูรณ์ — ดำเนินการต่อไป
         ExecuteStrategy();
      }
      else if(status == LINK_DELAYED) {
         // ⚠️ มีความล่าช้า — ลดความถี่ของการเช็ค
         Print("[EA] Bridge latency detected, reducing trade frequency");
      }
      else if(status == LINK_PARTIAL) {
         // ⚡ บางส่วนขาด — ตรวจสอบเพิ่มเติม
         Print("[EA] Partial link, verifying individual modules");
         DebugPartialLink();
      }
      else if(status == LINK_BROKEN) {
         // ❌ ขาด — หยุดการซื้อขาย
         Print("[EA] Bridge broken! Trading suspended");
         CloseAllPositions();
      }
   }

   // ═══════════════════════════════════════════════════════════════
   // 4. Every 100 ticks, print validation history
   // ═══════════════════════════════════════════════════════════════
   static int print_ticker = 0;
   print_ticker++;
   if(print_ticker >= 100) {
      g_validator.PrintHistoryReport();
      print_ticker = 0;
   }
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   Print(\"\\n[Bridge_Integration] OnDeinit - Final Validation Report:\");
   g_validator.PrintHistoryReport();

   // ตรวจสอบคะแนนสุดท้าย
   double final_score = g_validator.GetAverageScore();
   Print(StringFormat(
      \"[Bridge_Integration] Final Score: %.2f/1.0 = %s\",
      final_score, g_validator.GetScoreGrade(final_score)
   ));
}

//+------------------------------------------------------------------+
// HELPER: Simulate .mqh library data update
// (ในระบบจริง จะโดย Bridge จาก .mqh)
//+------------------------------------------------------------------+
void SimulateContextUpdate() {
   static datetime last_update = 0;
   if(TimeCurrent() - last_update < 1) return;  // Update every 1 second

   // Simulate different scenarios
   static int scenario = 0;
   scenario = (scenario + 1) % 5;

   switch(scenario) {
      case 0:  // ✅ Good signal
         g_context.bias = BIAS_BULLISH;
         g_context.biasStrength = 0.85;
         g_context.setupFound = true;
         g_context.confluenceScore = 0.88;
         g_context.entryPrice = iClose(_Symbol, PERIOD_CURRENT, 0);
         g_context.sl = g_context.entryPrice - 100*_Point;
         g_context.tp1 = g_context.entryPrice + 200*_Point;
         break;

      case 1:  // ⚠️ Weak signal
         g_context.bias = BIAS_FLAT;
         g_context.biasStrength = 0.40;
         g_context.setupFound = false;
         g_context.confluenceScore = 0.45;
         break;

      case 2:  // ⭐ Strong setup
         g_context.bias = BIAS_BULLISH;
         g_context.biasStrength = 0.95;
         g_context.setupFound = true;
         g_context.confluenceScore = 0.92;
         g_context.entryPrice = iClose(_Symbol, PERIOD_CURRENT, 0);
         g_context.sl = g_context.entryPrice - 50*_Point;
         g_context.tp1 = g_context.entryPrice + 300*_Point;
         g_context.tp2 = g_context.entryPrice + 600*_Point;
         break;

      case 3:  // 🐻 Bearish signal
         g_context.bias = BIAS_BEARISH;
         g_context.biasStrength = 0.75;
         g_context.setupFound = true;
         g_context.confluenceScore = 0.70;
         g_context.entryPrice = iClose(_Symbol, PERIOD_CURRENT, 0);
         g_context.sl = g_context.entryPrice + 120*_Point;
         g_context.tp1 = g_context.entryPrice - 250*_Point;
         break;

      case 4:  // ❌ Conflicting data (data integrity issue)
         g_context.bias = BIAS_BULLISH;
         g_context.setupFound = true;
         g_context.confluenceScore = 0.0;  // ← Contradiction!
         g_context.entryPrice = iClose(_Symbol, PERIOD_CURRENT, 0);
         g_context.sl = g_context.entryPrice + 100*_Point;  // ← SL above entry!
         g_context.tp1 = g_context.entryPrice - 200*_Point;  // ← TP below entry!
         break;
   }

   last_update = TimeCurrent();
}

//+------------------------------------------------------------------+
// HELPER: Execute trading strategy (only if validation passes)
//+------------------------------------------------------------------+
void ExecuteStrategy() {
   // Check if we already have a position
   if(PositionsTotal() > 0) return;

   if(g_context.setupFound && g_context.confluenceScore > 0.65) {
      if(g_context.bias == BIAS_BULLISH) {
         // Open BUY order
         Print(StringFormat(
            \"[Strategy] Opening BUY | Confluence: %.2f | SL: %.5f | TP: %.5f\",
            g_context.confluenceScore, g_context.sl, g_context.tp1
         ));
      }
      else if(g_context.bias == BIAS_BEARISH) {
         // Open SELL order
         Print(StringFormat(
            \"[Strategy] Opening SELL | Confluence: %.2f | SL: %.5f | TP: %.5f\",
            g_context.confluenceScore, g_context.sl, g_context.tp1
         ));
      }
   }
}

//+------------------------------------------------------------------+
// HELPER: Debug partial link issues
//+------------------------------------------------------------------+
void DebugPartialLink() {
   Print(\"\\n[DEBUG] Checking individual validation components:\");
   Print(StringFormat(\"  - Signal Flow: %s\", g_context.setupFound ? \"OK\" : \"ISSUE\"));
   Print(StringFormat(\"  - Confidence: %.2f/1.0\", g_context.confluenceScore));
   Print(StringFormat(\"  - Data Integrity: Entry=%.5f, SL=%.5f, TP=%.5f\",
      g_context.entryPrice, g_context.sl, g_context.tp1));
}

//+------------------------------------------------------------------+
// HELPER: Emergency close all positions
//+------------------------------------------------------------------+
void CloseAllPositions() {
   for(int i = PositionsTotal()-1; i >= 0; i--) {
      if(PositionSelectByTicket(PositionGetTicket(i))) {
         if(PositionGetString(POSITION_SYMBOL) == _Symbol) {
            // Close logic here (using CTrade or OrderSend)
            Print(StringFormat(\"Closing position #%d\", PositionGetInteger(POSITION_TICKET)));
         }
      }
   }
}
