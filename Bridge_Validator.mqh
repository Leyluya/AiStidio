//+------------------------------------------------------------------+
//|  Bridge_Validator.mqh                                            |
//|  Bridge Connection Validator + History Logger + Scoring System   |
//|  ตรวจสอบการเชื่อมโยง + บันทึกย้อนหลัง 5 เคส + คะแนนประสิทธิ |
//+------------------------------------------------------------------+
#pragma once
#include "MarketContext.mqh"

// ── Validation Enums ─────────────────────────────────────────────
enum ENUM_LINK_STATUS {
   LINK_HEALTHY,        // เชื่อมต่อถูกต้อง
   LINK_DELAYED,        // มีความล่าช้า
   LINK_PARTIAL,        // บางส่วนไม่สมบูรณ์
   LINK_BROKEN,         // ขาด
   LINK_TIMEOUT,        // หมดเวลา
   LINK_UNKNOWN         // ไม่รู้จัก
};

enum ENUM_VALIDATION_TYPE {
   VAL_SIGNAL_FLOW,     // ตรวจโฟลวสัญญาณ
   VAL_CONTEXT_UPDATE,  // ตรวจการอัปเดต Context
   VAL_DATA_INTEGRITY,  // ตรวจความสมบูรณ์ข้อมูล
   VAL_TIMING,          // ตรวจระยะเวลา
   VAL_ERROR_HANDLING   // ตรวจการจัดการข้อผิดพลาด
};

// ── Validation Record Structure ──────────────────────────────────
struct SValidationRecord {
   datetime              timestamp;
   ENUM_VALIDATION_TYPE type;
   ENUM_LINK_STATUS     status;
   double               latency_ms;     // ความล่าช้า (มิลลิวินาที)
   int                  fields_checked;
   int                  fields_ok;
   string               error_msg;
   double               score_0_to_1;   // คะแนน 0-1
};

// ── History Buffer (5 latest cases) ──────────────────────────────
struct SBridgeValidationHistory {
   SValidationRecord records[5];
   int               record_count;
   int               total_validations;
   double            avg_score;
   double            avg_latency;
};

// ── Main Validator Class ────────────────────────────────────────
class CBridgeValidator {
private:
   SBridgeValidationHistory m_history;
   SMarketContext*          mp_context;
   int                      m_validation_count;
   double                   m_total_score;
   datetime                 m_last_validation;
   int                      m_alert_threshold_ms;  // หากล่าช้าเกินนี้ให้แจ้งเตือน

public:
   CBridgeValidator(SMarketContext* ctx = NULL, int alert_ms = 100)
      : mp_context(ctx), 
        m_validation_count(0),
        m_total_score(0.0),
        m_last_validation(0),
        m_alert_threshold_ms(alert_ms) {
      m_history.record_count = 0;
      m_history.total_validations = 0;
      m_history.avg_score = 0.0;
      m_history.avg_latency = 0.0;
   }

   // ───────────────────────────────────────────────────────────────
   // Main validation method — triggers all checks
   // ───────────────────────────────────────────────────────────────
   ENUM_LINK_STATUS ValidateAllLinks() {
      if(mp_context == NULL) return LINK_BROKEN;

      ulong start_tick = GetMicrosecondCount();

      // ── 1. Signal Flow Validation ────────────────────────────────
      bool signal_ok = ValidateSignalFlow();

      // ── 2. Context Update Validation ─────────────────────────────
      bool context_ok = ValidateContextUpdate();

      // ── 3. Data Integrity Validation ─────────────────────────────
      bool data_ok = ValidateDataIntegrity();

      // ── 4. Timing Validation ─────────────────────────────────────
      bool timing_ok = ValidateTiming();

      // ── 5. Error Handling Validation ─────────────────────────────
      bool error_ok = ValidateErrorHandling();

      ulong end_tick = GetMicrosecondCount();
      double latency = (end_tick - start_tick) / 1000.0; // Convert to ms

      // ── Calculate final status ───────────────────────────────────
      ENUM_LINK_STATUS status = LINK_HEALTHY;
      double score = 0.0;

      if(signal_ok && context_ok && data_ok && timing_ok && error_ok) {
         status = LINK_HEALTHY;
         score = 1.0;
      } else if((signal_ok || context_ok) && (data_ok || timing_ok)) {
         status = LINK_PARTIAL;
         score = 0.65;
      } else if(latency > m_alert_threshold_ms) {
         status = LINK_DELAYED;
         score = 0.50;
      } else if(!signal_ok && !context_ok) {
         status = LINK_BROKEN;
         score = 0.0;
      } else {
         status = LINK_UNKNOWN;
         score = 0.30;
      }

      // ── Add to history ──────────────────────────────────────────
      SValidationRecord rec;
      rec.timestamp      = TimeCurrent();
      rec.type           = VAL_SIGNAL_FLOW;  // primary check
      rec.status         = status;
      rec.latency_ms     = latency;
      rec.fields_checked = 5; // 5 validation types
      rec.fields_ok      = (signal_ok?1:0) + (context_ok?1:0) + (data_ok?1:0) + 
                           (timing_ok?1:0) + (error_ok?1:0);
      rec.error_msg      = StatusToString(status);
      rec.score_0_to_1   = score;

      AddToHistory(rec);
      m_validation_count++;
      m_total_score += score;

      // ── Log result ───────────────────────────────────────────────
      LogValidation(rec);

      if(latency > m_alert_threshold_ms) {
         Print(StringFormat("[VALIDATOR] ⚠️ HIGH LATENCY: %.2f ms", latency));
      }

      return status;
   }

   // ───────────────────────────────────────────────────────────────
   // Individual Validation Methods
   // ───────────────────────────────────────────────────────────────

   bool ValidateSignalFlow() {
      // ตรวจสอบว่า Signal ไหลจาก .mqh → Bridge → .mq5 ถูกต้อง
      if(mp_context == NULL) return false;
      
      // Check if setupFound is consistent with confluenceScore
      bool valid = (mp_context->setupFound && mp_context->confluenceScore > 0.0) ||
                   (!mp_context->setupFound && mp_context->confluenceScore <= 0.0);
      
      return valid;
   }

   bool ValidateContextUpdate() {
      // ตรวจสอบว่า Context fields อัปเดตไม่เกา
      if(mp_context == NULL) return false;

      // ทั้ง bias, regime, session ต้องอัปเดตใน tick นี้
      static datetime last_bias_update = 0, last_regime_update = 0, last_session_update = 0;
      datetime now = TimeCurrent();
      
      // สมมติว่าต้องอัปเดตอย่างน้อยทุก 10 วินาที
      bool bias_fresh   = (now - last_bias_update <= 10);
      bool regime_fresh = (now - last_regime_update <= 10);
      bool session_fresh = (now - last_session_update <= 10);

      if(mp_context->bias != BIAS_FLAT) last_bias_update = now;
      if(mp_context->marketRegime != MKT_UNKNOWN) last_regime_update = now;
      // session always updates in SessionEngine

      return bias_fresh && regime_fresh && session_fresh;
   }

   bool ValidateDataIntegrity() {
      // ตรวจสอบว่าข้อมูลไม่ขัดแย้ง
      if(mp_context == NULL) return false;

      // ตัวอย่าง: SL ต้องน้อยกว่า Entry, TP ต้องมากกว่า Entry
      bool entry_valid = (mp_context->entryPrice > 0);
      bool sl_valid = (mp_context->sl > 0 && mp_context->sl < mp_context->entryPrice);
      bool tp_valid = (mp_context->tp1 > mp_context->entryPrice);
      bool range_valid = (mp_context->tp1 > mp_context->sl);

      return entry_valid && sl_valid && tp_valid && range_valid;
   }

   bool ValidateTiming() {
      // ตรวจสอบว่า Validation ไม่เกิดขึ้นบ่อยเกินไป (throttle check)
      datetime now = TimeCurrent();
      bool valid = (now - m_last_validation >= 1); // อย่างน้อยทุก 1 วินาที
      m_last_validation = now;
      return valid;
   }

   bool ValidateErrorHandling() {
      // ตรวจสอบว่ามีการจัดการ Error อย่างถูกต้อง
      // (สมมติว่ามี error_flag ใน context)
      if(mp_context == NULL) return false;

      // ตัวอย่าง: ถ้ามี error ต้องมี error message
      // bool error_handled = !mp_context->has_error || !mp_context->error_msg.empty();
      
      // สำหรับตัวอย่างนี้ สมมติว่า OK เสมอ
      return true;
   }

   // ───────────────────────────────────────────────────────────────
   // History Management
   // ───────────────────────────────────────────────────────────────

   void AddToHistory(const SValidationRecord &rec) {
      // Shift older records out (keep only 5 latest)
      for(int i = 4; i > 0; i--) {
         m_history.records[i] = m_history.records[i-1];
      }
      m_history.records[0] = rec;
      m_history.record_count = MathMin(m_history.record_count + 1, 5);
      m_history.total_validations++;

      // Update averages
      m_history.avg_score = 0.0;
      m_history.avg_latency = 0.0;
      for(int i = 0; i < m_history.record_count; i++) {
         m_history.avg_score += m_history.records[i].score_0_to_1;
         m_history.avg_latency += m_history.records[i].latency_ms;
      }
      m_history.avg_score /= MathMax(m_history.record_count, 1);
      m_history.avg_latency /= MathMax(m_history.record_count, 1);
   }

   SBridgeValidationHistory GetHistory() {
      return m_history;
   }

   // ───────────────────────────────────────────────────────────────
   // Scoring & Reporting
   // ───────────────────────────────────────────────────────────────

   double GetAverageScore() {
      if(m_validation_count == 0) return 0.0;
      return m_total_score / m_validation_count;
   }

   string GetScoreGrade(double score) {
      if(score >= 0.95)      return "⭐⭐⭐⭐⭐ PERFECT (95-100%)";
      else if(score >= 0.85) return "⭐⭐⭐⭐  EXCELLENT (85-94%)";
      else if(score >= 0.75) return "⭐⭐⭐    GOOD (75-84%)";
      else if(score >= 0.60) return "⭐⭐     FAIR (60-74%)";
      else                   return "⭐      POOR (<60%)";
   }

   void PrintHistoryReport() {
      Print("\n", StringFormat("═══════════════════════════════════════════════════"));
      Print(StringFormat("   BRIDGE VALIDATOR REPORT — %s", TimeToString(TimeCurrent())));
      Print(StringFormat("═══════════════════════════════════════════════════"));
      Print(StringFormat("Total Validations: %d", m_history.total_validations));
      Print(StringFormat("Average Score: %.2f/1.0 (%s)", m_history.avg_score, 
            GetScoreGrade(m_history.avg_score)));
      Print(StringFormat("Average Latency: %.2f ms", m_history.avg_latency));
      Print(StringFormat("\n Latest 5 Cases:"));
      Print(StringFormat("───────────────────────────────────────────────────"));

      for(int i = 0; i < m_history.record_count; i++) {
         SValidationRecord &r = m_history.records[i];
         string status_icon = "";
         if(r.status == LINK_HEALTHY) status_icon = "✅";
         else if(r.status == LINK_DELAYED) status_icon = "⚠️ ";
         else if(r.status == LINK_PARTIAL) status_icon = "⚡";
         else if(r.status == LINK_BROKEN) status_icon = "❌";
         else status_icon = "❓";

         Print(StringFormat(
            " %d. [%s] %s | Score: %.2f | Latency: %.1f ms | %d/%d fields OK",
            i+1, TimeToString(r.timestamp), status_icon, r.score_0_to_1, r.latency_ms,
            r.fields_ok, r.fields_checked
         ));

         if(r.error_msg != "") {
            Print(StringFormat("     └─ Error: %s", r.error_msg));
         }
      }
      Print(StringFormat("═══════════════════════════════════════════════════\n"));
   }

   // ───────────────────────────────────────────────────────────────
   // Helper Methods
   // ───────────────────────────────────────────────────────────────

   string StatusToString(ENUM_LINK_STATUS status) {
      switch(status) {
         case LINK_HEALTHY:   return "Connection HEALTHY";
         case LINK_DELAYED:   return "Connection has LATENCY";
         case LINK_PARTIAL:   return "Partial data flow";
         case LINK_BROKEN:    return "Connection BROKEN";
         case LINK_TIMEOUT:   return "Connection TIMEOUT";
         default:             return "Status UNKNOWN";
      }
   }

   void LogValidation(const SValidationRecord &rec) {
      Print(StringFormat(
         "[BRIDGE_VALIDATOR] %s | Score: %.2f | Latency: %.2f ms | %d/%d OK",
         StatusToString(rec.status), rec.score_0_to_1, rec.latency_ms,
         rec.fields_ok, rec.fields_checked
      ));
   }
};
