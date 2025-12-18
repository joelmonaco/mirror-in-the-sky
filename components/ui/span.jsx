function Span({className, children, ...props}) {
    return <span className={className} {...props}>{children}</span>
}

export {Span}