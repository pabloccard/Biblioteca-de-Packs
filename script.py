path = 'src/app/[lang]/pack/[id]/PackContent.tsx'
content = open(path).read()

content = content.replace(
    '<div className="sheet-backdrop" onClick={() => router.back()} />',
    '<div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} onClick={() => router.back()} />'
)
content = content.replace(
    '<div className="sheet-backdrop" />',
    '<div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} />'
)
content = content.replace(
    '<div className="sheet-card" onClick={(e) => e.stopPropagation()}>',
    '<div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`} onClick={(e) => e.stopPropagation()}>'
)
content = content.replace(
    '<div className="sheet-card">',
    '<div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`}>'
)

open(path, 'w').write(content)
print("Done")
