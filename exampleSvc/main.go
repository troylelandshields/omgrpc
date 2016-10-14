package main

import (
	"errors"
	"fmt"
	"net"
	"os"

	"golang.org/x/net/context"

	"google.golang.org/grpc"
)

func main() {
	svc := &Svc{}

	lis, err := net.Listen("tcp", "localhost:6565")
	if err != nil {
		fmt.Println("Unexpected err:", err)
		os.Exit(1)
	}

	srv := grpc.NewServer()

	RegisterExampleServiceServer(srv, svc)

	fmt.Println("Serving example grpc service:", lis.Addr().String())
	srv.Serve(lis)

}

type Svc struct {
}

//SayHello says the requested phrase
func (svc *Svc) SayHello(ctx context.Context, req *SayRequest) (*SayReply, error) {

	if req.SayWhat == "" {
		return nil, errors.New("Must request server to say something!")
	}

	fmt.Println("Say Request:", req.SayWhat)

	return &SayReply{
		SaidWhat: fmt.Sprintf("Server says, \"%s\"", req.SayWhat),
	}, nil
}
