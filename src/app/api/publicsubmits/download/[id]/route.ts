import { publicSubmitById } from "@/lib/posts/data";
import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch submission by ID
    const submission = await publicSubmitById(id);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Create a new Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: submission.title || "Başlık Yok",
                  bold: true,
                  size: 32, // 16px
                }),
              ],
              alignment: "center",
            }),
            // Summary
            new Paragraph({
              children: [
                new TextRun({
                  text: submission.summary || "Özet Yok",
                  size: 32, // 16px
                }),
              ],
              spacing: { before: 300, after: 300 }, // 15-point spacing
            }),
            // Content
            new Paragraph({
              children: [
                new TextRun({
                  text: submission.content || "İçerik Yok",
                  size: 32, // 16px
                }),
              ],
              spacing: { before: 300, after: 300 }, // 15-point spacing
            }),
          ],
        },
      ],
    });

    // Generate the Word file
    const buffer = await Packer.toBuffer(doc);

    // Convert buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Return the file as a response
    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename=submission-${id}.docx`,
      },
    });
  } catch (error) {
    console.error("Error generating Word document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
