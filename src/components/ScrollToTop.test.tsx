import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { vi } from 'vitest'
import { ScrollToTop } from './ScrollToTop'

function Page({ name }: { name: string }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <>
      <h1>{name}</h1>
      <p>filter: {searchParams.get('filter') ?? 'none'}</p>
      <Link to={name === 'First' ? '/second' : '/first'}>Next page</Link>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => setSearchParams({ filter: 'open' }, { replace: true })}>
        Apply filter
      </button>
    </>
  )
}

test('scrolls new pages to the top but leaves back navigation to browser restoration', async () => {
  const user = userEvent.setup()
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  render(
    <MemoryRouter initialEntries={['/first']}>
      <ScrollToTop />
      <Routes>
        <Route path="/first" element={<Page name="First" />} />
        <Route path="/second" element={<Page name="Second" />} />
      </Routes>
    </MemoryRouter>,
  )

  expect(scrollTo).not.toHaveBeenCalled()
  await user.click(screen.getByRole('link', { name: 'Next page' }))
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })

  scrollTo.mockClear()
  await user.click(screen.getByRole('button', { name: 'Back' }))
  expect(await screen.findByRole('heading', { name: 'First' })).toBeInTheDocument()
  expect(scrollTo).not.toHaveBeenCalled()
})

test('does not scroll when a query-param replace navigation stays on the same page', async () => {
  const user = userEvent.setup()
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  render(
    <MemoryRouter initialEntries={['/first']}>
      <ScrollToTop />
      <Routes>
        <Route path="/first" element={<Page name="First" />} />
        <Route path="/second" element={<Page name="Second" />} />
      </Routes>
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Apply filter' }))
  expect(await screen.findByText('filter: open')).toBeInTheDocument()
  expect(scrollTo).not.toHaveBeenCalled()

  // A real route change afterwards still scrolls to the top.
  await user.click(screen.getByRole('link', { name: 'Next page' }))
  expect(await screen.findByRole('heading', { name: 'Second' })).toBeInTheDocument()
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
})
