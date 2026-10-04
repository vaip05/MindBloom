export default function Card({ children, className = '', as: Tag = 'section', ...props }) {
  return (
    <Tag className={`rounded-[1.75rem] ${className}`} {...props}>
      {children}
    </Tag>
  )
}
