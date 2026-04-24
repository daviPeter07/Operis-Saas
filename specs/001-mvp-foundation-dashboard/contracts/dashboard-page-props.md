# Contract: Overview Dashboard Page Props

## Purpose

Define the page-level contract for the Day 2 overview dashboard.

## Query Contract

The overview page accepts explicit period selection through query parameters.

| Parameter | Allowed Values | Notes |
|--------|-------------|-------------|
| `period` | `last_7_days`, `last_month`, `last_3_months`, `last_year`, `all`, `custom` | Required for every dashboard request |
| `from` | date string | Only used when `period = custom` |
| `to` | date string | Only used when `period = custom` |

## Page Prop Contract

```text
dashboard:
  filters:
    available:
      - key
        label
    selected:
      period
      from
      to
  metrics:
    - key
      label
      value
      comparison
      trendDirection
  charts:
    - key
      label
      series
      xAxis
      emptyStateMessage
  recentActivity:
    - id
      type
      title
      description
      timestamp
  emptyStateFlags:
    hasMetrics
    hasCharts
    hasActivity
```

## Required Dashboard Areas

- KPI cards for:
  - vendas
  - lucro
  - contas a receber
  - contas a pagar
- chart datasets for:
  - sales over time
  - profit over time
  - payable vs receivable comparison
- recent activity feed

## View State Rules

- the selected period always comes from the server response
- KPI/chart mode may remain presentation-level state if no shareable URL requirement emerges during implementation
- changing period must refresh metrics, charts, and recent activity together
- empty ranges must still return the same contract shape with explicit empty-state messaging

## Acceptance Mapping

| Requirement Area | Contract Signal |
|--------|-------------|
| filter is applied | `filters.selected` changes and corresponding sections update |
| KPI mode is available | `metrics` is always present for the selected filter |
| chart mode is available | `charts` is always present for the selected filter |
| recent activity exists | `recentActivity` is present, even if empty-state messaging is needed |
| no-data period handled | `emptyStateFlags` and section-level empty messages are populated |
