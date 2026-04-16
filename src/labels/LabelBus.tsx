// labels/LabelBus.ts
import { SupportedLang } from './registry'

type Subscriber = (lang: SupportedLang) => void

class LabelBusClass {
  private lang: SupportedLang = 'en'
  private subs = new Set<Subscriber>()

  subscribe(fn: Subscriber) {
    this.subs.add(fn)
    return () => this.subs.delete(fn)   // returns unsubscribe
  }

  publish(lang: SupportedLang) {
    this.lang = lang
    this.subs.forEach(fn => fn(lang))
  }

  getLang() { return this.lang }
}

// Singleton — same instance across the whole app
export const LabelBus = new LabelBusClass()