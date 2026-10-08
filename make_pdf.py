import html
import re
import os
import reportlab
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

pdf_path = r"c:\Users\tirup\OneDrive\Desktop\cloud_project\Project_Collaboration_Workspace_Implementation_Plan.pdf"
md_path = r"C:\Users\tirup\.gemini\antigravity\brain\a71d95fe-031d-4131-9d80-9bd12e86ff6c\implementation_plan.md"

with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=36,
    leftMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()

primary_color = colors.HexColor('#005A9C')
secondary_color = colors.HexColor('#1F2937')
text_color = colors.HexColor('#374151')

title_style = ParagraphStyle('DocTitle', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=primary_color, spaceAfter=10)
h1_style = ParagraphStyle('SectionH1', fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=secondary_color, spaceBefore=12, spaceAfter=6)
h2_style = ParagraphStyle('SectionH2', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=primary_color, spaceBefore=10, spaceAfter=4)
h3_style = ParagraphStyle('SectionH3', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=secondary_color, spaceBefore=8, spaceAfter=4)
body_style = ParagraphStyle('BodyCustom', fontName='Helvetica', fontSize=9, leading=13, textColor=text_color, spaceAfter=5)
bullet_style = ParagraphStyle('BulletCustom', parent=body_style, leftIndent=12, bulletIndent=4, spaceAfter=3)
code_style = ParagraphStyle('CodeCustom', fontName='Courier', fontSize=8, leading=10, textColor=colors.HexColor('#111827'), backColor=colors.HexColor('#F3F4F6'), borderColor=colors.HexColor('#E5E7EB'), borderWidth=1, borderPadding=5, spaceBefore=4, spaceAfter=6)

th_style = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.white)
td_style = ParagraphStyle('TD', fontName='Helvetica', fontSize=8, leading=11, textColor=text_color)

def parse_markdown_formatting(text):
    text = html.escape(text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    text = re.sub(r'`(.*?)`', r'<font face="Courier" color="#005A9C"><b>\1</b></font>', text)
    return text

story = []
in_code = False
code_lines = []
in_table = False
table_lines = []

def flush_table(t_lines):
    if not t_lines:
        return
    rows = []
    for l in t_lines:
        s = l.strip()
        if '---' in s:
            continue
        parts = [p.strip() for p in s.split('|')[1:-1]]
        if parts:
            rows.append(parts)
    if not rows:
        return
    
    t_data = []
    for r_idx, r in enumerate(rows):
        row_cells = []
        for c in r:
            st = th_style if r_idx == 0 else td_style
            formatted_c = parse_markdown_formatting(c)
            row_cells.append(Paragraph(formatted_c, st))
        t_data.append(row_cells)
    
    num_cols = len(rows[0])
    if num_cols == 3:
        col_w = [120, 50, 370]
    elif num_cols == 4:
        col_w = [110, 100, 150, 180]
    else:
        col_w = None
        
    t = Table(t_data, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ]))
    story.append(Spacer(1, 4))
    story.append(t)
    story.append(Spacer(1, 6))

for line in lines:
    raw_line = line.rstrip('\r\n')
    sline = raw_line.strip()

    if sline.startswith('```'):
        if in_code:
            in_code = False
            code_text = html.escape('\n'.join(code_lines))
            story.append(Preformatted(code_text, code_style))
            code_lines = []
        else:
            if in_table:
                flush_table(table_lines)
                in_table = False
                table_lines = []
            in_code = True
            code_lines = []
        continue

    if in_code:
        code_lines.append(raw_line)
        continue

    if '|' in sline and sline.startswith('|'):
        in_table = True
        table_lines.append(sline)
        continue
    else:
        if in_table:
            flush_table(table_lines)
            in_table = False
            table_lines = []

    if not sline:
        story.append(Spacer(1, 3))
        continue

    if sline.startswith('# '):
        story.append(Paragraph(parse_markdown_formatting(sline[2:]), title_style))
        story.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceAfter=8))
    elif sline.startswith('## '):
        story.append(Paragraph(parse_markdown_formatting(sline[3:]), h1_style))
        story.append(HRFlowable(width='100%', thickness=0.8, color=colors.HexColor('#D1D5DB'), spaceAfter=5))
    elif sline.startswith('### '):
        story.append(Paragraph(parse_markdown_formatting(sline[4:]), h2_style))
    elif sline.startswith('#### '):
        story.append(Paragraph(parse_markdown_formatting(sline[5:]), h3_style))
    elif sline.startswith('- ') or sline.startswith('* '):
        story.append(Paragraph(f'&bull; {parse_markdown_formatting(sline[2:])}', bullet_style))
    elif len(sline) > 2 and sline[0].isdigit() and sline[1:3] in ['. ', ') ']:
        story.append(Paragraph(f'{sline[:2]} {parse_markdown_formatting(sline[3:])}', bullet_style))
    else:
        story.append(Paragraph(parse_markdown_formatting(sline), body_style))

if in_table:
    flush_table(table_lines)

doc.build(story)
print("SUCCESS: PDF created at", pdf_path)
