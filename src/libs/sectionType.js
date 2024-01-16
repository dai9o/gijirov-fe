export function getSectionTypeString(sectionType) {
  switch (sectionType) {
    case 1: return "議員"
    case 2: return "議長"
    case 3: return "行政"
    default: return "発言者分類未定義"
  }
}