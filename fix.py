path = 'src/app/[lang]/pack/[id]/PackContent.tsx'
content = open(path).read()

# Fix the broken empty className brackets
content = content.replace(
    '<div className={} onClick={() => router.back()}>',
    '<div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} onClick={() => router.back()}>'
)
content = content.replace(
    '<div className={} onClick={(e) => e.stopPropagation()}>',
    '<div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`} onClick={(e) => e.stopPropagation()}>'
)
content = content.replace(
    '<div className={} onClick={() => router.back()} />',
    '<div className={`sheet-backdrop ${skipAnimation ? "no-animation" : ""}`} onClick={() => router.back()} />'
)

# Wait, there's another broken empty state
content = content.replace(
    '<div className={}>',
    '<div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`}>'
)

# The main one
content = content.replace(
    '<div className="sheet-card" onClick={(e) => e.stopPropagation()}>',
    '<div className={`sheet-card ${skipAnimation ? "no-animation" : ""}`} onClick={(e) => e.stopPropagation()}>'
)

open(path, 'w').write(content)
print("Repaired PackContent.tsx")
