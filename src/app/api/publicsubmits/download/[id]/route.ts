import { publicSubmitById } from "@/lib/posts/data";
import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch submission by ID
    const submission = await publicSubmitById(id);
    console.log("Fetched submission for download:", submission);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    const buildTextParagraph = (label: string, value: string | undefined) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 24 }),
          new TextRun({ text: value || "Belirtilmedi", size: 24 }),
        ],
        spacing: { after: 120 },
      });

    const imageBaseUrl =
      process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
      "https://kapdem-org.s3.eu-north-1.amazonaws.com";

    const rawPhoto =
      typeof submission.photo === "string" ? submission.photo.trim() : "";

    const photoUrl = rawPhoto
      ? /^https?:\/\//i.test(rawPhoto)
        ? rawPhoto
        : /(^|\/)(public-submissions|uploads|images)\//i.test(rawPhoto)
          ? `${imageBaseUrl}/${rawPhoto.replace(/^\/+/, "")}`
          : /(^|\/)[^.\/]+\.s3\.[^.\/]+\.amazonaws\.com\//i.test(rawPhoto) ||
              rawPhoto.startsWith("kapdem-org.s3.eu-north-1.amazonaws.com")
            ? `https://${rawPhoto.replace(/^\/+/, "")}`
            : `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/${rawPhoto.replace(/^\/+/, "")}`
      : "";

    // Fotoğrafı önce indir ki belgenin en üstüne koyabilelim.
    // (kapdem copy PDF düzeniyle aynı: görsel başta → başlık → yazar·tarih → içerik)
    let imageParagraph: Paragraph | null = null;
    if (photoUrl) {
      try {
        const photoResponse = await fetch(photoUrl);
        if (photoResponse.ok) {
          const photoBuffer = Buffer.from(await photoResponse.arrayBuffer());
          const imageType = photoResponse.headers
            .get("content-type")
            ?.includes("jpeg")
            ? "jpg"
            : "png";
          imageParagraph = new Paragraph({
            children: [
              new ImageRun({
                data: photoBuffer,
                type: imageType,
                transformation: { width: 420, height: 320 },
              }),
            ],
            alignment: "center",
            spacing: { after: 240 },
          });
        }
      } catch (error) {
        console.error("Error fetching photo for document:", error);
      }
    }

    const docChildren = [
      // 1. Fotoğraf (en üstte)
      ...(imageParagraph ? [imageParagraph] : []),
      // 2. Başlık
      new Paragraph({
        children: [
          new TextRun({
            text: submission.title || "Başlık Yok",
            bold: true,
            size: 32,
            color: "002C54",
          }),
        ],
        alignment: "center",
        spacing: { after: 240 },
      }),
      // 3. Yazar · Gönderim Tarihi
      buildTextParagraph(
        "Yazar",
        `${submission.firstName || ""} ${submission.lastName || ""}`.trim(),
      ),
      buildTextParagraph("Gönderim Tarihi", submission.submittedAt),
      // 4. Diğer iletişim / teknik bilgiler
      buildTextParagraph("E-posta", submission.email),
      buildTextParagraph("Telefon", submission.phone),
      buildTextParagraph("Kurum", submission.institution),
      buildTextParagraph("Durum", submission.status),
      buildTextParagraph("IP Adresi", submission.ipAddress),
      buildTextParagraph("Tarayıcı", submission.userAgent),
      // 5. İçerik bölümleri
      new Paragraph({
        children: [new TextRun({ text: "Özet", bold: true, size: 28 })],
        spacing: { before: 180, after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: submission.summary || "Özet yok", size: 24 }),
        ],
        spacing: { after: 180 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Kısa Biyografi", bold: true, size: 28 }),
        ],
        spacing: { before: 180, after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: submission.biografi || "Biyografi yok",
            size: 24,
          }),
        ],
        spacing: { after: 180 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "İçerik", bold: true, size: 28 })],
        spacing: { before: 180, after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: submission.content || "İçerik yok", size: 24 }),
        ],
        spacing: { after: 180 },
      }),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
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
      { status: 500 },
    );
  }
}
