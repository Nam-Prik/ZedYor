import type { FormEvent } from 'react'
import { useState } from 'react'
import { getIncidentsByOfficer } from '../../../api/incident-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { IncidentByOfficer } from '../../../types/dto/incident-report.dto'

type Row = IncidentByOfficer & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'incidentId', label: 'ID', width: '70px' },
  {
    key: 'incidentDatetime',
    label: 'Date',
    width: '130px',
    render: (val) => new Date(String(val)).toLocaleDateString(),
  },
  { key: 'locationName', label: 'Location' },
  { key: 'description', label: 'Description' },
  { key: 'daysSinceIncident', label: 'Days Ago', width: '100px' },
  { key: 'prisonerCode', label: 'Prisoner Code', width: '140px', render: (val) => val ?? '—' },
  {
    key: 'prisonerFirstName',
    label: 'First Name',
    render: (val) => val ?? '—',
  },
  {
    key: 'prisonerLastName',
    label: 'Last Name',
    render: (val) => val ?? '—',
  },
]

export default function IncidentsByOfficer() {
  const [officerId, setOfficerId] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [inputError, setInputError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = Number(officerId)
    if (officerId === '' || Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      setInputError('Please enter a valid officer ID (positive integer)')
      return
    }
    setInputError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getIncidentsByOfficer(parsed)
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
        <h1 className="page-header__title">Incidents by Officer</h1>
        <p className="page-header__subtitle">
          List all incidents documented by a specific reporting officer.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Officer ID" htmlFor="officerId" required error={inputError}>
              <Input
                id="officerId"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 4"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
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
              emptyMessage={`No incidents found for officer ID ${officerId}`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
