import type { FC } from 'react'
import './RulesModal.css'

interface RulesModalProps {
  title: string
  rules: string[]
  onClose: () => void
}

const RulesModal: FC<RulesModalProps> = ({ title, rules, onClose }) => (
  <div className="rm-overlay" onClick={onClose}>
    <div className="rm-panel" onClick={e => e.stopPropagation()}>
      <h2>📖 {title}</h2>
      <ul className="rm-list">
        {rules.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
      <button className="rm-close" onClick={onClose}>知道了</button>
    </div>
  </div>
)

export default RulesModal
