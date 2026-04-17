from io import BytesIO
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import Response
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from models.schemas import ReportRequest

router = APIRouter()


@router.post("")
def generate_report(request: ReportRequest):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    styleN = styles["BodyText"]
    styleH = styles["Heading1"]

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    story = []

    story.append(Paragraph("Patient Details ", styleH))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Patient Name : <b>{request.name.title()}</b>", styleN))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Patient Age : <b>{request.age} Years</b>", styleN))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Report Generated On : <b>{current_time}</b>", styleN))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Predicted Disease : <b>{request.disease.title()}</b>", styleN))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Description : <b>{request.description}</b>", styleN))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Precautions : ", styleH))
    story.append(Spacer(1, 12))
    story.append(ListFlowable(
        [ListItem(Paragraph(p, styleN)) for p in request.precautions if p is not None],
        bulletType="bullet",
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Recommendations : ", styleH))
    story.append(Spacer(1, 12))
    story.append(ListFlowable(
        [ListItem(Paragraph(w, styleN)) for w in request.workout],
        bulletType="bullet",
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Diets :", styleH))
    story.append(Spacer(1, 12))
    story.append(ListFlowable(
        [ListItem(Paragraph(d, styleN)) for d in request.diets],
        bulletType="bullet",
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Medications :", styleH))
    story.append(Spacer(1, 12))
    story.append(ListFlowable(
        [ListItem(Paragraph(m, styleN)) for m in request.medications],
        bulletType="bullet",
    ))
    story.append(Spacer(1, 12))

    doc.build(story)
    pdf_bytes = buffer.getvalue()

    filename = f"CuraWise_{request.name}_Report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
