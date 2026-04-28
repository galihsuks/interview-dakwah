function toSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function downloadBlob(content: string, type: string, filename: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}

export function openHtmlInNewTab(html: string): void {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadHtmlVariant(
    plainHtml: string,
    productName: string,
    variantLabel: string,
): void {
    const productSlug = toSlug(productName) || "sales-page";
    const variantSlug = toSlug(variantLabel) || "variant";
    const filename = `${productSlug}-${variantSlug}.html`;

    downloadBlob(plainHtml, "text/html;charset=utf-8", filename);
}
