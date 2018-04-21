def read_varint(stream):
    ret = 0
    pos = 0

    while True:
        v = stream.read(1)
        if len(v) != 1:
            return None
        v = v[0]

        w = v & 127
        ret |= w << pos

        if (v & 128) == 0:
            break

        pos += 7

    return ret
