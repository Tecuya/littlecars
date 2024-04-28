LASTPATCH=$(find /app/trajectories/ -iname '*i1*.patch' | grep Tecuya | sort -n | tail -n 1)
echo "Last patch is $LASTPATCH and Im gonna apply it"

cd /git
patch -p 1 < $LASTPATCH
cd /app
