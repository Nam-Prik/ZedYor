import type { FormEvent } from 'react'
import { useState } from 'react'
import { getInvolvedPrisonersByLocation } from '../../../api/incident-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { InvolvedPrisonerByLocation } from '../../../types/dto/incident-report.dto'

type Row = InvolvedPrisonerByLocation & { _idx: number }

const RISK_VARIANT: Record<string, 'danger' | 'warning' | 'neutral'> = {
  'High Risk / Requires Escort': 'danger',
  'Monitor closely': 'warning',
  'Standard Protocol': 'neutral',
}

const COLUMNS: Column<Row>[] = [
  { key: 'prisonerCode', label: 'Code', width: '130px' },
  { key: 'prisonerFirstName', label: 'First Name' },
  { key: 'prisonerLastName', label: 'Last Name' },
  {
    key: 'incidentDatetime',
    label: 'Incident Date',
    width: '140px',
    render: (val) => new Date(String(val)).toLocaleDateString(),
  },
  { key: 'evaluationScore', label: 'Eval Score', width: '110px' },
  {
    key: 'riskAlert',
    label: 'Risk Alert',
    render: (val) => {
      const label = String(val)
      const variant = RISK_VARIANT[label] ?? 'neutral'
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  { key: 'daysAgo', label: 'Days Ago', width: '100px' },
]

export default function InvolvedPrisonersByLocation() {
  const [locationId, setLocationId] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [inputError, setInputError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = Number(locationId)
    if (locationId === '' || Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      setInputError('Please enter a valid location ID (positive integer)')
      return
    }
    setInputError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getInvolvedPrisonersByLocation(parsed)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Involved Prisoners by Location</h1>
        <p className="page-header__subtitle">
          List all prisoners involved in incidents at a specific prison location, including risk assessment.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Location ID" htmlFor="locationId" required error={inputError}>
              <Input
                id="locationId"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 10"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                error={!!inputError}
              />
            </FormGroup>
          </div>
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </form>
      </Card>

      {error && <p className="page-error">{error}</p>}

      {searched && (
        <div className="report-results">
          <Card
            title={rows.length > 0 ? `Results — ${rows.length} record(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage={`No prisoners found for location ID ${locationId}`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
