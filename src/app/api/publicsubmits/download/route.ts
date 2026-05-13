import { publicSubmitList } from "@/lib/posts/data";
import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function GET() {
  try {
    // Fetch submissions
    const submissions = await publicSubmitList();

    // Create a new Word document with sections
    const doc = new Document({
      sections: submissions.map((submission: any, index: number) => {
        const children = [
          new Paragraph({
            children: [
              new TextRun({
                text: `Submission ${index + 1}`,
                bold: true,
                size: 28,
              }),
            ],
          }),
        ];

        // Format each key-value pair in the submission
        Object.entries(submission).forEach(([key, value]) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${key}: `,
                  bold: true,
                }),
                new TextRun({
                  text: `${value}`,
                }),
              ],
            })
          );
        });

        return {
          properties: {},
          children,
        };
      }),
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
        "Content-Disposition": "attachment; filename=submissions.docx",
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
