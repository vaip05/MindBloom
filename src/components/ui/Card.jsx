export default function Card({ children, className = '', as: Tag = 'section', ...props }) {
  return (
    <Tag className={`rounded-md ${className}`} {...props}>
      {children}
    </Tag>
  )
}
