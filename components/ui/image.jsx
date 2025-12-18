function Image({className, ...props}) {
    return (
        <img {...props} className={className}/>
    )
}

export {Image}