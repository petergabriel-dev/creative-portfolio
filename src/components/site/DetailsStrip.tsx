import styles from './DetailsStrip.module.css'

type DetailsStripProps = {
  items: { label: string; value?: string | number | null }[]
  tone: 'dark' | 'light'
}

/** Short facts in an auto-fit grid: opener details or credits (docs/design/components/DetailsStrip.md). */
export function DetailsStrip({ items, tone }: DetailsStripProps) {
  const facts = items
    .map(({ label, value }) => ({ label, value: value == null ? '' : String(value).trim() }))
    .filter(({ value }) => value !== '')
  if (facts.length === 0) return null

  return (
    <dl className={`${styles.strip} ${tone === 'dark' ? styles.dark : styles.light}`}>
      {facts.map(({ label, value }, index) => (
        <div className={styles.item} key={`${index}-${label}`}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
