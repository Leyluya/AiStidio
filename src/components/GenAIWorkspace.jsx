import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES & CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const AI_TEMPLATES = {
  dataAnalyst: {
    id: "dataAnalyst",
    name: "📊 Data Analyst",
    color: "#0ea5e9",
    emoji: "📊",
    description: "วิเคราะห์ข้อมูล ปลายทาง วิจารณ์",
    basePrompt: `You are a professional data analyst. Analyze data patterns, trends, and provide actionable insights.`,
    fields: ["dataContext", "question"],
  },
  designer: {
    id: "designer",
    name: "🎨 Design AI",
    color: "#ec4899",
    emoji: "🎨",
    description: "สร้าง concept, color palette, layout ออกแบบ",
    basePrompt: `You are a creative design expert. Generate design concepts, color schemes, and layout suggestions.`,
    fields: ["designBrief", "targetAudience"],
  },
  hrConsultant: {
    id: "hrConsultant",
    name: "👔 HR Consultant",
    color: "#8b5cf6",
    emoji: "👔",
    description: "ให้คำปรึกษา HR, recruitment, employee relations",
    basePrompt: `You are an HR consultant. Provide advice on recruitment, employee relations, and organizational strategies.`,
    fields: ["hrChallenge", "companyContext"],
  },
  technicalWriter: {
    id: "technicalWriter",
    name: "📝 Tech Writer",
    color: "#06b6d4",
    emoji: "📝",
    description: "เขียน documentation, API docs, technical guides",
    basePrompt: `You are a technical writer. Create clear, concise documentation and technical guides.`,
    fields: ["topic", "audience"],
  },
  contentCreator: {
    id: "contentCreator",
    name: "✍️ Content Creator",
    color: "#f59e0b",
    emoji: "✍️",
    description: "สร้างเนื้อหา blog, social media, marketing copy",
    basePrompt: `You are a creative content creator. Write engaging content for blogs, social media, and marketing.`,
    fields: ["contentType", "targetMessage"],
  },
  custom: {
    id: "custom",
    name: "🔧 Custom AI",
    color: "#10b981",
    emoji: "🔧",
    description: "สร้าง AI persona แบบกำหนดเอง",
    basePrompt: "",
    fields: ["customPrompt"],
  },
};

const STICKY_COLORS = [
  "#fef3c7", // yellow
  "#fecaca", // red
  "#bfdbfe", // blue
  "#dbeafe", // light blue
  "#d1fae5", // green
  "#ede9fe", // purple
  "#fce7f3", // pink
];

// ─────────────────────────────────────────────────────────────────────────────
// STICKY NOTE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function StickyNote({ note, onRemove, onUpdate, onPin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.content);

  return (
    <div
      style={{
        background: note.color,
        width: 280,
        minHeight: 240,
        borderRadius: 8,
        padding: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        position: "relative",
        cursor: "grab",
        transform: `rotate(${note.rotation}deg)`,
        transition: "transform 0.2s",
        fontFamily: "'Comic Sans MS', cursive",
        border: note.isPinned ? "2px solid #ef4444" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = `rotate(0deg) scale(1.02)`)}
      onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${note.rotation}deg) scale(1)`)}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 18 }}>{note.emoji}</div>
        <div style={{ fontSize: 11, color: "#666", fontWeight: 700 }}>{note.templateName}</div>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          <button
            onClick={() => onPin(note.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              opacity: 0.5,
            }}
          >
            {note.isPinned ? "📌" : "📍"}
          </button>
          <button
            onClick={() => onRemove(note.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              opacity: 0.5,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onUpdate(note.id, { content: text });
          }}
          autoFocus
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "'Comic Sans MS', cursive",
            fontSize: 13,
            color: "#333",
            resize: "none",
            padding: "4px 0",
          }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          style={{
            flex: 1,
            fontSize: 13,
            color: "#333",
            lineHeight: 1.6,
            cursor: "text",
            wordWrap: "break-word",
            minHeight: 100,
            overflow: "auto",
          }}
        >
          {text || "(empty note)"}
        </div>
      )}

      {/* Footer */}
      <div style={{ fontSize: 9, color: "#999", textAlign: "right" }}>
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GEN AI INPUT PANEL
// ─────────────────────────────────────────────────────────────────────────────
function GenAIPanel({ onGenerate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState("dataAnalyst");
  const [inputs, setInputs] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const template = AI_TEMPLATES[selectedTemplate];
  const fields = template.fields || [];

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    const mockOutput = `Generated content from ${template.name}...\n\nThis is a sample output based on your inputs: ${JSON.stringify(inputs)}`;
    setOutput(mockOutput);
    setShowPreview(true);
    setIsGenerating(false);
  };

  const handleSave = () => {
    onGenerate({
      templateId: selectedTemplate,
      templateName: template.name,
      emoji: template.emoji,
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
      content: output,
      inputs,
    });
    setOutput("");
    setShowPreview(false);
    setInputs({});
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100vh",
        width: 420,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderLeft: "1px solid #334155",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 24 }}>✨</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#00d4ff", letterSpacing: 1 }}>GEN AI</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Create AI Content</div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Template Selector */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Select Template
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.values(AI_TEMPLATES).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: selectedTemplate === t.id ? `2px solid ${t.color}` : "1px solid #334155",
                  background: selectedTemplate === t.id ? `${t.color}15` : "transparent",
                  color: selectedTemplate === t.id ? t.color : "#94a3b8",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{t.emoji}</div>
                <div>{t.name.split(" ")[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Description */}
        <div
          style={{
            background: `${template.color}12`,
            border: `1px solid ${template.color}33`,
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 12,
            color: template.color,
          }}
        >
          {template.description}
        </div>

        {/* Input Fields */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Inputs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {fields.map((field) => (
              <div key={field}>
                <label style={{ fontSize: 11, color: "#cbd5e1", display: "block", marginBottom: 4, fontWeight: 600 }}>
                  {field.replace(/([A-Z])/g, " $1").toUpperCase()}
                </label>
                <textarea
                  value={inputs[field] || ""}
                  onChange={(e) => setInputs({ ...inputs, [field]: e.target.value })}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    minHeight: 70,
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 6,
                    padding: "10px 12px",
                    color: "#e2e8f0",
                    fontFamily: "monospace",
                    fontSize: 12,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      {showPreview && (
        <div
          style={{
            background: "#0f172a",
            borderTop: "1px solid #334155",
            padding: "16px 24px",
            maxHeight: "280px",
            overflowY: "auto",
            fontSize: 12,
            color: "#cbd5e1",
            lineHeight: 1.6,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {output}
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #334155", display: "flex", gap: 8 }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !Object.values(inputs).some((v) => v)}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: isGenerating ? "#475569" : "#0ea5e9",
            color: "white",
            fontWeight: 700,
            cursor: isGenerating ? "wait" : "pointer",
            fontSize: 12,
            transition: "all 0.2s",
          }}
        >
          {isGenerating ? "🔄 Generating..." : "✨ Generate"}
        </button>
        {showPreview && (
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 6,
              border: "none",
              background: "#10b981",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            💾 Save Note
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
export default function GenAIWorkspace() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("aiStudio_notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [showPanel, setShowPanel] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const canvasRef = useRef(null);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("aiStudio_notes", JSON.stringify(notes));
  }, [notes]);

  const handleGenerate = (data) => {
    const newNote = {
      id: Date.now(),
      templateId: data.templateId,
      templateName: data.templateName,
      emoji: data.emoji,
      color: data.color,
      content: data.content,
      inputs: data.inputs,
      createdAt: new Date(),
      isPinned: false,
      rotation: Math.random() * 6 - 3, // -3 to 3 degrees
    };
    setNotes([...notes, newNote]);
    setShowPanel(false);
  };

  const handleRemoveNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleUpdateNote = (id, updates) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const handlePinNote = (id) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleExportAll = () => {
    const json = JSON.stringify(notes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-studio-vault-${Date.now()}.json`;
    a.click();
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const regularNotes = notes.filter((n) => !n.isPinned);

  return (
    <div
      ref={canvasRef}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* WordPress-like Header/Toolbar */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>✨</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>GenAI Studio</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>WordPress + Sticky Note Workspace</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginLeft: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "#f1f5f9",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>📝</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{notes.length}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>Notes</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "#fef3c7",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>📌</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#78350f" }}>{pinnedNotes.length}</div>
              <div style={{ fontSize: 10, color: "#92400e" }}>Pinned</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowVault(!showVault)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: showVault ? "#f1f5f9" : "white",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: "#0f172a",
              transition: "all 0.2s",
            }}
          >
            🗂️ Vault
          </button>
          <button
            onClick={() => setShowPanel(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#0ea5e9",
              color: "white",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              transition: "all 0.2s",
            }}
          >
            + New AI
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div
        style={{
          padding: "40px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignContent: "flex-start",
          minHeight: "calc(100vh - 100px)",
        }}
      >
        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <div style={{ width: "100%", marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              📌 PINNED ({pinnedNotes.length})
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {pinnedNotes.map((note) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onRemove={handleRemoveNote}
                  onUpdate={handleUpdateNote}
                  onPin={handlePinNote}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        {regularNotes.length > 0 && (
          <div style={{ width: "100%" }}>
            {pinnedNotes.length > 0 && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  marginBottom: 16,
                }}
              >
                📝 ALL NOTES ({regularNotes.length})
              </div>
            )}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {regularNotes.map((note) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onRemove={handleRemoveNote}
                  onUpdate={handleUpdateNote}
                  onPin={handlePinNote}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              gap: 16,
            }}
          >
            <div style={{ fontSize: 64 }}>✨</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#64748b" }}>No Notes Yet</div>
            <div style={{ color: "#94a3b8", textAlign: "center", maxWidth: 300 }}>
              Click "+ New AI" button to generate your first AI-powered note using our templates!
            </div>
            <button
              onClick={() => setShowPanel(true)}
              style={{
                marginTop: 16,
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                background: "#0ea5e9",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ✨ Create Your First AI Note
            </button>
          </div>
        )}
      </div>

      {/* Vault Modal */}
      {showVault && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowVault(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 32,
              maxWidth: 500,
              boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 24, marginBottom: 16 }}>🗂️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>AI Vault</div>
            <div style={{ color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              Manage all your AI-generated notes. You can export them as JSON backup or share with others.
            </div>

            <div style={{ background: "#f1f5f9", borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>VAULT STATS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0ea5e9" }}>{notes.length}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Total Notes</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{pinnedNotes.length}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Pinned</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowVault(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                Close
              </button>
              <button
                onClick={handleExportAll}
                disabled={notes.length === 0}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: notes.length > 0 ? "#10b981" : "#cbd5e1",
                  color: "white",
                  cursor: notes.length > 0 ? "pointer" : "not-allowed",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                📥 Export JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gen AI Panel */}
      {showPanel && <GenAIPanel onGenerate={handleGenerate} onClose={() => setShowPanel(false)} />}
    </div>
  );
}
