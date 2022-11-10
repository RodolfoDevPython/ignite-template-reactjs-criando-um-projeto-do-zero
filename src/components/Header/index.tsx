import styles from "./header.module.scss";

import Link from "next/link"

export default function Header() {

  return (
    <Link href='/' passHref >
      <a>
        <header className={styles.container}>
          <img src="/icons/logo.svg" alt="logo" />
        </header>
      </a>      
    </Link>
  )
}
