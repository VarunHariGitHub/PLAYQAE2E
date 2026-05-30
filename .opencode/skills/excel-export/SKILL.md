---
name: excel-export
description: Export Jira defects and test data to formatted Excel spreadsheets
---

## When to use
Use when you need to export defect reports, test results, or any tabular data to a formatted .xlsx file.

## Prerequisite
Install ImportExcel PowerShell module:
```powershell
Install-Module -Name ImportExcel -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck
```

## Basic pattern
```powershell
$data = @(
    [PSCustomObject]@{ Field = "Issue"; Value = "KAN-4" }
)
$data | Export-Excel "test-data/report.xlsx" -WorksheetName "Summary" -AutoSize -BoldTopRow
```

## Multi-sheet with styling
```powershell
# Sheet 1
$data1 | Export-Excel $path -WorksheetName "Summary" -AutoSize -BoldTopRow

# Sheet 2
$data2 | Export-Excel $path -WorksheetName "Details" -AutoSize -BoldTopRow -Append

# Reopen to style
$excel = Open-ExcelPackage $path
$ws = $excel.Workbook.Worksheets["Summary"]
$ws.Column(1).Style.Fill.PatternType = "Solid"
$ws.Column(1).Style.Fill.BackgroundColor.SetColor("#4472C4")
$ws.Column(1).Style.Font.Color.SetColor("#FFFFFF")
Close-ExcelPackage $excel
```

## Sheet color conventions
| Sheet | Header color | Purpose |
|---|---|---|
| Summary | Blue #4472C4 | Issue metadata |
| Description | None | Bug description |
| Fix Applied | Green #548235 | Resolution details |
| Changelog | Gold #BF8F00 | Status changes |

## Output location
Save all exports to `test-data/` (gitignored).
