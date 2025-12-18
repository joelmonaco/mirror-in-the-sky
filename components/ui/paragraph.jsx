function Paragraph({className, children, ...props}) {
    return <p {...props} className={className}>{children}</p>
}

export {Paragraph}