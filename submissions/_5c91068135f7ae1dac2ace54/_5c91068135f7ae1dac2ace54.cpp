#include<bits/stdc++.h>
#define ll long long
using namespace std;
int main() {
    ll spaces;
    cin>>spaces;
    cin.ignore();
    string line;
    int length,cnt;
    while(getline(cin,line)) {
        length = line.length();
        for(int i=0;i<length;i++) {
            if(line[i]==' ') {
                cnt++;
            }
        }
    }
    if(spaces<cnt) {
        cout<<"<3";
    } else {
        cout<<"-_-";
    }
}