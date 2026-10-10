import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_architecture_diagram():
    fig, ax = plt.subplots(figsize=(12, 7.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    # Color Scheme
    BG_COLOR = "#f8fafc"
    CARD_BG = "#ffffff"
    BORDER_BLUE = "#0284c7"
    BORDER_GREEN = "#059669"
    BORDER_AMBER = "#d97706"
    BORDER_PURPLE = "#7c3aed"
    TEXT_DARK = "#0f172a"
    TEXT_MUTED = "#475569"

    fig.patch.set_facecolor(BG_COLOR)

    # Main Title Header Box
    ax.add_patch(patches.FancyBboxPatch(
        (0.5, 6.7), 11.0, 0.6.copy() if hasattr(0.6, 'copy') else 0.6,
        boxstyle="round,pad=0.03,rounding_size=0.1",
        facecolor="#0f172a", edgecolor="none"
    ))
    ax.text(6.0, 7.0, "SyncSphere — Cloud-Native System Architecture Diagram",
            color="white", fontsize=15, fontweight="bold", ha="center", va="center")

    # Layer 1: Presentation Tier (React SPA)
    ax.add_patch(patches.FancyBboxPatch(
        (0.5, 3.6), 3.4, 2.8,
        boxstyle="round,pad=0.03,rounding_size=0.15",
        facecolor=CARD_BG, edgecolor=BORDER_BLUE, linewidth=2
    ))
    ax.text(2.2, 6.1, "1. Presentation Tier (React SPA)", color=BORDER_BLUE, fontsize=11, fontweight="bold", ha="center")
    ax.text(2.2, 5.75, "Hosted: Azure App Service", color=TEXT_MUTED, fontsize=8.5, ha="center")

    components_l1 = [
        "• React 18 + Vite + TailwindCSS",
        "• Passwordless Auth Gateway",
        "• Kanban Task Board UI",
        "• Cloud Asset Manager UI",
        "• Real-Time AI Scanner Card",
        "• Client Session Store (localStorage)"
    ]
    for i, comp in enumerate(components_l1):
        ax.text(0.7, 5.3 - (i * 0.28), comp, color=TEXT_DARK, fontsize=8.5)

    # Layer 2: Application Microservices Tier (Node.js REST API)
    ax.add_patch(patches.FancyBboxPatch(
        (4.3, 3.6), 3.4, 2.8,
        boxstyle="round,pad=0.03,rounding_size=0.15",
        facecolor=CARD_BG, edgecolor=BORDER_GREEN, linewidth=2
    ))
    ax.text(6.0, 6.1, "2. Application Tier (Node.js API)", color=BORDER_GREEN, fontsize=11, fontweight="bold", ha="center")
    ax.text(6.0, 5.75, "Azure App Service (app-syncsphere-api-2026)", color=TEXT_MUTED, fontsize=8, ha="center")

    components_l2 = [
        "• Express.js REST API Server",
        "• Passwordless Identity Gateway",
        "• Automated AI Security Scanner Engine",
        "• File Streaming Controller (Multer)",
        "• System Telemetry Health Route",
        "• Device-Aware Audit Engine"
    ]
    for i, comp in enumerate(components_l2):
        ax.text(4.5, 5.3 - (i * 0.28), comp, color=TEXT_DARK, fontsize=8.5)

    # Layer 3: Cloud Storage & Fallback Tier
    ax.add_patch(patches.FancyBboxPatch(
        (8.1, 3.6), 3.4, 2.8,
        boxstyle="round,pad=0.03,rounding_size=0.15",
        facecolor=CARD_BG, edgecolor=BORDER_AMBER, linewidth=2
    ))
    ax.text(9.8, 6.1, "3. Storage & Resilience Tier", color=BORDER_AMBER, fontsize=11, fontweight="bold", ha="center")
    ax.text(9.8, 5.75, "Azure Storage Account (stsyncsphere2026)", color=TEXT_MUTED, fontsize=8, ha="center")

    components_l3 = [
        "• Azure Blob Container: workspace-assets",
        "• Memory Buffer Pipeline (@azure/storage-blob)",
        "• Automatic MIME Type Preservation",
        "• SAS Blob Download Token Engine",
        "• Instant Blob Deletion API",
        "• High-Availability In-Memory Fallback"
    ]
    for i, comp in enumerate(components_l3):
        ax.text(8.3, 5.3 - (i * 0.28), comp, color=TEXT_DARK, fontsize=8.5)

    # Layer 4: Infrastructure & DevOps Layer (Bottom Box)
    ax.add_patch(patches.FancyBboxPatch(
        (0.5, 0.6), 11.0, 2.4,
        boxstyle="round,pad=0.03,rounding_size=0.15",
        facecolor=CARD_BG, edgecolor=BORDER_PURPLE, linewidth=2
    ))
    ax.text(6.0, 2.7, "4. Security, Observability & DevOps Pipeline Layer", color=BORDER_PURPLE, fontsize=11, fontweight="bold", ha="center")

    devops_left = [
        "• Authentication: Passwordless Email + Locked clientSessionId",
        "• Security Scanning: Static Heuristic Regex Analyzer (Secrets, CORS, HTTP)",
        "• Secret Management: Encrypted Azure App Settings Environment Variables"
    ]
    devops_right = [
        "• Telemetry: Device-Aware Audit Stream (Desktop vs Mobile) + Uptime Health API",
        "• Automation: Python Kudu Deployment Script (create_webapp.py)",
        "• Version Control: GitHub Repository (Tirupathi-Reddy-Pucha/SyncSphere)"
    ]

    for i, text in enumerate(devops_left):
        ax.text(0.7, 2.25 - (i * 0.45), text, color=TEXT_DARK, fontsize=8.5)
    for i, text in enumerate(devops_right):
        ax.text(6.2, 2.25 - (i * 0.45), text, color=TEXT_DARK, fontsize=8.5)

    # Connecting Arrows
    # Layer 1 -> Layer 2
    ax.annotate("", xy=(4.25, 5.0), xytext=(3.95, 5.0),
                arrowprops=dict(arrowstyle="->", color=BORDER_BLUE, lw=2))
    ax.text(4.1, 5.15, "HTTPS REST", fontsize=7.5, color=BORDER_BLUE, ha="center", fontweight="bold")

    # Layer 2 -> Layer 3
    ax.annotate("", xy=(8.05, 5.0), xytext=(7.75, 5.0),
                arrowprops=dict(arrowstyle="->", color=BORDER_GREEN, lw=2))
    ax.text(7.9, 5.15, "Buffer Stream", fontsize=7.5, color=BORDER_GREEN, ha="center", fontweight="bold")

    # Layer 2 -> Layer 4
    ax.annotate("", xy=(6.0, 3.55), xytext=(6.0, 3.05),
                arrowprops=dict(arrowstyle="->", color=BORDER_PURPLE, lw=2))
    ax.text(6.5, 3.3, "Audit & Telemetry", fontsize=7.5, color=BORDER_PURPLE, ha="center", fontweight="bold")

    output_path = r"c:\Users\tirup\OneDrive\Desktop\cloud_project\architecture_diagram.png"
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"SUCCESS: Architecture diagram saved to {output_path}")

if __name__ == "__main__":
    draw_architecture_diagram()
