import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return (
    <div className={styles.container}>
      <div>
        <Link href={'/'}>
          <img src={'/Logo.svg'} alt={'logo'} />
        </Link>
      </div>
    </div>
  )
}
